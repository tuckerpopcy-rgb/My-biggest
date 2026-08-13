import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { peekPlayable, playableUrl } from '../lib/mediaVault';

export function SalonVideo({
  uri,
  style,
  autoPlay = true,
  height = 220,
}: {
  uri?: string | null;
  style?: ViewStyle;
  autoPlay?: boolean;
  height?: number;
}) {
  const instant = useMemo(() => peekPlayable(uri), [uri]);
  const [src, setSrc] = useState(instant);

  useEffect(() => {
    let live = true;
    setSrc(peekPlayable(uri));
    (async () => {
      const next = await playableUrl(uri);
      if (live && next) setSrc(next);
    })();
    return () => {
      live = false;
    };
  }, [uri]);

  if (!src) {
    return <View style={[{ height, backgroundColor: '#0A1610', borderRadius: 14 }, style]} />;
  }

  if (Platform.OS === 'web') {
    const WebVideo = 'video' as unknown as React.ElementType;
    return (
      <View style={[{ height, borderRadius: 14, overflow: 'hidden', backgroundColor: '#000' }, style]}>
        <WebVideo
          src={src}
          controls
          autoPlay={autoPlay}
          muted={autoPlay}
          playsInline
          loop={autoPlay}
          style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000', display: 'block' }}
        />
      </View>
    );
  }

  return (
    <Video
      source={{ uri: src }}
      style={[{ height, width: '100%', borderRadius: 14, backgroundColor: '#000' }, style]}
      useNativeControls
      resizeMode={ResizeMode.COVER}
      shouldPlay={autoPlay}
      isMuted={autoPlay}
      isLooping={autoPlay}
    />
  );
}

export const videoStyles = StyleSheet.create({
  frame: { width: '100%', backgroundColor: '#000', borderRadius: 14, overflow: 'hidden' },
});
