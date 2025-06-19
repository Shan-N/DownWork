
# 🚀 DownWork – Freelance & Client Marketplace (Next.js 15)

**DownWork** is a modern freelance marketplace built with **Next.js 15**, **Supabase**, **TailwindCSS**, and **Docker**. It supports client and freelancer roles, secure auth, project matching, and scalable deployment using Docker & Nginx.

---

## ✨ Features

- 🔐 Supabase Auth (Email & GitHub OAuth)
- 🧑‍💼 Role-Based Profiles (Freelancer/Client)
- 💼 Skill-based Project Listing & Matching
- 🛡️ Row-Level Security (RLS) in Supabase
- 🌘 Dark Mode UI with TailwindCSS
- 🐳 Docker + Nginx Ready for EC2 Deployment

---

## 🛠️ Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/downwork.git
cd downwork
```

### 2. Setup `.env.production`

Create a `.env.production` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🧾 Supabase Schema

### `profiles` Table

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('freelancer', 'client')),
  skills text[],
  created_at timestamp default now()
);
alter table profiles enable row level security;

create policy "Profile read access" on profiles
  for select using (auth.uid() = id);

create policy "Profile update access" on profiles
  for update using (auth.uid() = id);
```

### `projects` Table

```sql
create table projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id),
  title text,
  description text,
  skills text[],
  created_at timestamp default now()
);
alter table projects enable row level security;

create policy "Read access for all" on projects
  for select using (true);

create policy "Insert/update by owner" on projects
  for insert, update using (auth.uid() = owner_id);
```

---

## 🧪 Local Development

```bash
npm install
npm run dev
```

> Runs at: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

### Build and Run

```bash
docker build -t your-dockerhub/downwork .
docker push your-dockerhub/downwork
```

### Using `docker-compose.yml`

```yaml
version: '3.8'
services:
  app:
    image: your-dockerhub/downwork:latest
    env_file: .env.production
    restart: always
    ports:
      - "3000:3000"
    networks:
      - app-network
networks:
  app-network:
    driver: bridge
```

### Start with Docker Compose

```bash
docker-compose up -d
```

---

## 🌐 Production Setup (EC2 + Nginx + SSL)

1. Create Nginx config:

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

2. Install Certbot for SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🧰 Tech Stack

- [Next.js 15](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- Docker + Docker Compose
- Nginx Reverse Proxy

---

## 📄 License

MIT © 2025 Shantanu Neve
