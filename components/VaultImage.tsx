import React, { useEffect, useState } from 'react';
import { StyleProp, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { peekPlayable, playableUrl } from '../lib/mediaVault';

export function VaultImage({
  uri,
  style,
  contentFit = 'cover',
}: {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain';
}) {
  const [src, setSrc] = useState(peekPlayable(uri) || (uri && !uri.startsWith('vault:') ? uri : ''));

  useEffect(() => {
    let live = true;
    const instant = peekPlayable(uri) || (uri && !uri.startsWith('vault:') ? uri : '');
    setSrc(instant);
    (async () => {
      const next = await playableUrl(uri);
      if (live && next) setSrc(next);
    })();
    return () => {
      live = false;
    };
  }, [uri]);

  if (!src) return null;
  return <Image source={{ uri: src }} style={style} contentFit={contentFit} />;
}
