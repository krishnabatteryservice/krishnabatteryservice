import test from 'node:test';
import assert from 'node:assert/strict';
import socialData from '../data/socialMedia.json';
import {
  filterReelsByPlatform,
  generateReelId,
  isSafeHttpUrl,
  normalizeSocialUrl,
  parseReelEmbedUrl,
  parseStoredSocialMedia,
  validateReelDraft,
  type SocialMediaData,
} from './socialMedia';

const FALLBACK_DATA = socialData as SocialMediaData;

test('isSafeHttpUrl and normalizeSocialUrl allow https/http and block unsafe schemes', () => {
  assert.equal(isSafeHttpUrl('https://instagram.com/krishnabattery'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,hi'), false);
  assert.equal(
    normalizeSocialUrl('instagram.com/krishnabattery'),
    'https://instagram.com/krishnabattery',
  );
  assert.equal(normalizeSocialUrl('javascript:alert(1)'), '');
});

test('parseReelEmbedUrl extracts YouTube Shorts, Instagram Reels, Facebook Reels, and X links cleanly', () => {
  const ytShort = parseReelEmbedUrl(
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'youtube',
  );
  assert.equal(ytShort.canEmbed, true);
  assert.equal(ytShort.platform, 'youtube');
  assert.equal(
    ytShort.embedUrl,
    'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0',
  );

  const igReel = parseReelEmbedUrl(
    'https://www.instagram.com/reel/C8AbCdEf123/',
    'instagram',
  );
  assert.equal(igReel.canEmbed, true);
  assert.equal(igReel.platform, 'instagram');
  assert.equal(
    igReel.embedUrl,
    'https://www.instagram.com/reel/C8AbCdEf123/embed/',
  );

  const fbReel = parseReelEmbedUrl(
    'https://www.facebook.com/reel/123456789012345',
    'facebook',
  );
  assert.equal(fbReel.canEmbed, true);
  assert.equal(fbReel.platform, 'facebook');
  assert.match(fbReel.embedUrl ?? '', /^https:\/\/www\.facebook\.com\/plugins\/video\.php\?href=/);

  const gbpLink = parseReelEmbedUrl(
    'https://g.page/r/krishna-battery-service',
    'google-business',
  );
  assert.equal(gbpLink.canEmbed, false);
  assert.equal(gbpLink.platform, 'google-business');
  assert.equal(
    gbpLink.externalUrl,
    'https://g.page/r/krishna-battery-service',
  );
});

test('filterReelsByPlatform and validateReelDraft behave accurately', () => {
  const igOnly = filterReelsByPlatform(FALLBACK_DATA.reels, 'instagram');
  assert.ok(igOnly.length >= 1);
  assert.ok(igOnly.every((r) => r.platform === 'instagram'));

  const badDraft = validateReelDraft({
    platform: 'instagram',
    title: 'A',
    caption: '',
    reelUrl: 'javascript:alert(1)',
    thumbnail: '',
    duration: '0:30',
  });
  assert.equal(badDraft.valid, false);
  assert.ok(badDraft.errors.title);
  assert.ok(badDraft.errors.reelUrl);

  const goodDraft = validateReelDraft({
    platform: 'youtube',
    title: 'Amaron Battery Fitment Reel',
    caption: 'Live counter fitment clip',
    reelUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    thumbnail: '',
    duration: '0:35',
  });
  assert.equal(goodDraft.valid, true);
  assert.match(generateReelId('Amaron Battery Fitment', 1700000000000), /^reel-amaron-battery-fitment-/);
});

test('parseStoredSocialMedia handles null, corrupt JSON, and valid stored payloads safely', () => {
  assert.equal(parseStoredSocialMedia(null, FALLBACK_DATA).profiles.length, 4);
  assert.equal(parseStoredSocialMedia('{bad', FALLBACK_DATA).reels.length, FALLBACK_DATA.reels.length);

  const custom = JSON.stringify({
    profiles: FALLBACK_DATA.profiles,
    reels: [FALLBACK_DATA.reels[0]],
  });
  const parsed = parseStoredSocialMedia(custom, FALLBACK_DATA);
  assert.equal(parsed.reels.length, 1);
  assert.equal(parsed.profiles.length, 4);
});
