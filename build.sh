

set -a 
source .env.production
set +a

docker build \
  --build-arg NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -t shan117/downwork:latest .
