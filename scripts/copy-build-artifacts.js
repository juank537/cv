import { cp, mkdir } from 'fs/promises';
import { resolve } from 'path';

async function copyBuildArtifacts() {
  const root = process.cwd();
  const fromStatic = resolve(root, '.next/static');
  const toStatic = resolve(root, '.next/standalone/.next');
  const fromPublic = resolve(root, 'public');
  const toPublic = resolve(root, '.next/standalone');

  await mkdir(toStatic, { recursive: true });
  await cp(fromStatic, toStatic, { recursive: true });
  await cp(fromPublic, toPublic, { recursive: true });

  console.log('Build artifacts copied to .next/standalone.');
}

copyBuildArtifacts().catch((error) => {
  console.error('Failed to copy build artifacts:', error);
  process.exit(1);
});