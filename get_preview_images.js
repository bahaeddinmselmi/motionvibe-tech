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

async function getPreviewImages() {
  const { data, error } = await supabase
    .from('products')
    .select('preview_images')
    .eq('slug', 'youtube-automation')
    .single();

  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Preview images:', JSON.stringify(data.preview_images, null, 2));
  }
}

getPreviewImages();
