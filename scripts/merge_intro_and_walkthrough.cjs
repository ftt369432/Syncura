const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('ffmpeg-static');
const introSource = path.join(__dirname, '../Option_The_Emotional_Kitch.mp4');
const introSubtitles = path.join(__dirname, '../intro_subtitles.ass').replace(/\\/g, '/').replace(':', '\\:');
const intro1080p = path.join(__dirname, '../intro_with_subtitles_1080p.mp4');
const walkthroughVideo = path.join(__dirname, '../Syncura_Official_YouTube_Walkthrough_1080p_With_Music.mp4');
const finalMergedVideo = path.join(__dirname, '../Syncura_Official_Full_YouTube_Video_1080p.mp4');
const publicMergedVideo = path.join(__dirname, '../public/Syncura_Official_Full_YouTube_Video_1080p.mp4');

console.log('1. Encoding Emotional Intro Clip with Subtitles (1080p, 30fps)...');
const introCmd = `"${ffmpegPath}" -y -i "${introSource}" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,ass='${introSubtitles}'" -r 30 -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -ar 44100 -ac 2 "${intro1080p}"`;
execSync(introCmd, { stdio: 'inherit' });

console.log('\n2. Normalizing Walkthrough Audio to Stereo 44.1kHz...');
const normalizedWalkthrough = path.join(__dirname, '../walkthrough_normalized.mp4');
const normCmd = `"${ffmpegPath}" -y -i "${walkthroughVideo}" -c:v copy -c:a aac -b:a 192k -ar 44100 -ac 2 "${normalizedWalkthrough}"`;
execSync(normCmd, { stdio: 'inherit' });

console.log('\n3. Concatenating Emotional Intro (0:00-0:10) + Walkthrough with Tiles (0:10-1:18)...');
const concatListFile = path.join(__dirname, '../concat_list.txt');
fs.writeFileSync(concatListFile, `file '${intro1080p.replace(/\\/g, '/')}'\nfile '${normalizedWalkthrough.replace(/\\/g, '/')}'\n`, 'utf-8');

const concatCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListFile.replace(/\\/g, '/')}" -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart "${finalMergedVideo}"`;
execSync(concatCmd, { stdio: 'inherit' });

// Copy to public
fs.copyFileSync(finalMergedVideo, publicMergedVideo);

// Generate new thumbnail from peak emotional frame or app frame
const thumb720 = path.join(__dirname, '../public/youtube_thumbnail_1280x720.png');
const thumb1080 = path.join(__dirname, '../public/youtube_thumbnail_1920x1080.png');
const rootThumb720 = path.join(__dirname, '../youtube_thumbnail_1280x720.png');
const rootThumb1080 = path.join(__dirname, '../youtube_thumbnail_1920x1080.png');

execSync(`"${ffmpegPath}" -y -ss 00:00:04 -i "${finalMergedVideo}" -vframes 1 -s 1280x720 "${thumb720}"`);
execSync(`"${ffmpegPath}" -y -ss 00:00:04 -i "${finalMergedVideo}" -vframes 1 -s 1920x1080 "${thumb1080}"`);
fs.copyFileSync(thumb720, rootThumb720);
fs.copyFileSync(thumb1080, rootThumb1080);

const stat = fs.statSync(finalMergedVideo);
console.log('\n🎉 SUCCESS! Complete Master YouTube Video with Animation Intro & Subtitles Ready:');
console.log(`- File: ${finalMergedVideo} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
