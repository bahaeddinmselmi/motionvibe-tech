const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePreviewImages() {
  const newPreviews = [
    {
      "url": "/preview_editing_software.jpg",
      "caption": "Timeline Editor: Ready to import into CapCut, Premiere Pro, etc."
    },
    {
      "url": "/preview_drive_google.jpg",
      "caption": "Google Drive Assets: Completely organized folders"
    },
    {
      "url": "/preview_story_1.png",
      "caption": "Sample Story Scene 1: High-Retention Video Asset"
    },
    {
      "url": "/preview_story_2.png",
      "caption": "Sample Story Scene 2: High-Retention Video Asset"
    },
    {
      "url": "/preview_story_3.png",
      "caption": "Sample Story Scene 3: High-Retention Video Asset"
    },
    {
      "url": "/preview_story_4.png",
      "caption": "Sample Story Scene 4: High-Retention Video Asset"
    }
  ];

  console.log('Updating preview_images in database...');
  const { error } = await supabase
    .from('products')
    .update({ preview_images: newPreviews })
    .eq('slug', 'youtube-automation');

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Successfully updated preview images in database!');
  }
}

updatePreviewImages();
