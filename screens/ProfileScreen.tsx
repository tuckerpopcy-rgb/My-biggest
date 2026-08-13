// ============================================================
// Salon na we yon - Profile Screen
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, TextInput, Alert, Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../lib/context';
import { authService } from '../lib/auth';
import { getPostsByUser, toggleFollow, formatTimeAgo } from '../lib/social';
import { getPointsLevel, getPointsColor } from '../lib/points';
import { checkSubscriptionStatus } from '../lib/subscription';
import { Avatar, Card, Badge, Button } from '../components/UIComponents';
import { PointsBadge } from '../components/PointsBadge';
import type { User, Post } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen({ navigation, route }: any) {
  const { user, theme, refreshUser } = useApp();
  const c = theme.colors;
  const targetUserId = route?.params?.userId || user?.id;
  const isOwnProfile = targetUserId === user?.id;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;
    const u = await authService.getUserById(targetUserId);
    setProfileUser(u);
    const p = await getPostsByUser(targetUserId);
    setPosts(p);
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleFollow = async () => {
    if (!user || !profileUser) return;
    await toggleFollow(profileUser.id, user.id);
    await loadProfile();
    await refreshUser();
  };

  const handleUploadAvatar = async () => {
    if (!user) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        await authService.updateUser({ avatar: uri });
        await refreshUser();
        await loadProfile();
        Alert.alert('Success', 'Profile photo updated! It will sync across all platforms.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not upload photo. Please try again.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    await authService.updateUser({
      displayName: editName.trim(),
      bio: editBio.trim(),
    });
    setEditing(false);
    await refreshUser();
    await loadProfile();
  };

  if (loading || !profileUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.textSecondary }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { level, title } = getPointsLevel(profileUser.points);
  const levelColor = getPointsColor(level);
  const isFollowing = user?.following.includes(profileUser.id) || false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: c.primary }]}>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation?.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            {isOwnProfile && (
              <TouchableOpacity onPress={() => navigation?.navigate('Settings')}>
                <Ionicons name="settings-outline" size={26} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={[styles.profileSection, { backgroundColor: c.surface }]}>
          <View style={styles.avatarRow}>
            <TouchableOpacity onPress={isOwnProfile ? handleUploadAvatar : undefined} activeOpacity={0.8}>
              <Avatar uri={profileUser.avatar} size={90} theme={theme} name={profileUser.displayName} />
              {isOwnProfile && (
                <View style={[styles.cameraIcon, { backgroundColor: c.primary }]}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.displayName, { color: c.text }]}>{profileUser.displayName}</Text>
          <Text style={[styles.username, { color: c.textMuted }]}>@{profileUser.username}</Text>

          {profileUser.bio ? (
            <Text style={[styles.bio, { color: c.textSecondary }]}>{profileUser.bio}</Text>
          ) : null}

          {/* Badges */}
          <View style={styles.badgesRow}>
            <PointsBadge points={profileUser.points} />
            {profileUser.isDeveloper && <Badge theme={theme} text="⚙ DEV" color={c.accent} />}
            {profileUser.isSubscribed && <Badge theme={theme} text="⭐ SUBSCRIBED" color="#FFD700" />}
            <Badge theme={theme} text={`Lv.${level} ${title}`} color={levelColor} />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: c.text }]}>{profileUser.following.length}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Following</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: c.text }]}>{profileUser.followers.length}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: c.text }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: c.text }]}>{profileUser.quizHighScore}</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Quiz Best</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <Button
                  theme={theme}
                  title={isFollowing ? 'Following' : 'Follow'}
                  variant={isFollowing ? 'outline' : 'primary'}
                  onPress={handleFollow}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Button theme={theme} title="Message" variant="outline" onPress={() => {}} />
              </View>
            </View>
          )}

          {isOwnProfile && !editing && (
            <TouchableOpacity
              onPress={() => { setEditing(true); setEditName(profileUser.displayName); setEditBio(profileUser.bio); }}
              style={[styles.editBtn, { borderColor: c.border }]}
            >
              <Ionicons name="create-outline" size={18} color={c.textSecondary} />
              <Text style={{ color: c.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 6 }}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          {editing && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                style={[styles.editInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Display Name"
                placeholderTextColor={c.textMuted}
              />
              <TextInput
                style={[styles.editInput, { backgroundColor: c.surfaceAlt, color: c.text, borderColor: c.border }]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Bio"
                placeholderTextColor={c.textMuted}
                multiline
                maxLength={200}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button theme={theme} title="Save" onPress={handleSaveEdit} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button theme={theme} title="Cancel" variant="outline" onPress={() => setEditing(false)} />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Posts */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 }}>Posts</Text>
          {posts.length === 0 ? (
            <Text style={{ color: c.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>No posts yet</Text>
          ) : (
            posts.map(post => (
              <Card key={post.id} theme={theme}>
                <Text style={{ fontSize: 15, color: c.text, lineHeight: 22 }}>{post.content}</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                  <Text style={{ fontSize: 13, color: c.textMuted }}>❤️ {post.likes.length}</Text>
                  <Text style={{ fontSize: 13, color: c.textMuted }}>💬 {post.comments.length}</Text>
                  <Text style={{ fontSize: 13, color: c.textMuted }}>{formatTimeAgo(post.createdAt)}</Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 80, padding: 16, justifyContent: 'flex-end' },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between' },
  profileSection: { padding: 20, alignItems: 'center', marginTop: -30 },
  avatarRow: { marginTop: -15 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  displayName: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  username: { fontSize: 15, marginTop: 2 },
  bio: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20, paddingHorizontal: 20 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 20 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', marginTop: 16, width: '100%' },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1.5, marginTop: 12 },
  editInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
});
