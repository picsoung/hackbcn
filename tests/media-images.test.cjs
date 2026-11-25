const assert = require('node:assert/strict')
const { test } = require('node:test')
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})
const sharp = require('sharp')
const { normalizeImage, readImageBody } = require('../lib/media/images.ts')
const { MAX_IMAGE_BYTES, managedImageId } = require('../lib/media/shared.ts')

test('avatars are decoded, square, re-encoded and stripped of embedded metadata', async () => {
  const input = await sharp({
    create: { width: 900, height: 600, channels: 3, background: '#e97ca6' },
  })
    .withMetadata({
      orientation: 6,
      exif: { IFD0: { Artist: 'Private test metadata' } },
    })
    .jpeg()
    .toBuffer()
  assert.ok((await sharp(input).metadata()).exif)
  const result = await sharp(await normalizeImage(input, 'avatar')).metadata()
  assert.equal(result.format, 'webp')
  assert.equal(result.width, 512)
  assert.equal(result.height, 512)
  assert.equal(result.exif, undefined)
  assert.equal(result.icc, undefined)
  assert.equal(result.orientation, undefined)
})
test('project uploads preserve the full image within bounded dimensions', async () => {
  const input = await sharp({
    create: { width: 2400, height: 1800, channels: 3, background: '#254553' },
  })
    .png()
    .toBuffer()
  const result = await sharp(await normalizeImage(input, 'project')).metadata()
  assert.equal(result.width, 1600)
  assert.equal(result.height, 1200)
  assert.equal(result.format, 'webp')
})
test('uploads reject SVG disguised as PNG, invalid/truncated files and excessive bodies', async () => {
  for (const bytes of [
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    ),
    Buffer.from('not an image'),
    Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  ])
    await assert.rejects(
      () => normalizeImage(bytes, 'avatar'),
      (error) => error.code === 'invalid_image',
    )
  await assert.rejects(
    () =>
      readImageBody(
        new Request('http://localhost/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'image/svg+xml' },
          body: '<svg />',
        }),
      ),
    (error) => error.status === 415,
  )
  await assert.rejects(
    () =>
      readImageBody(
        new Request('http://localhost/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'image/png',
            'Content-Length': String(MAX_IMAGE_BYTES + 1),
          },
          body: 'x',
        }),
      ),
    (error) => error.status === 413,
  )
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_IMAGE_BYTES))
      controller.enqueue(new Uint8Array(1))
      controller.close()
    },
  })
  await assert.rejects(
    () =>
      readImageBody(
        new Request('http://localhost/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'image/png' },
          body: stream,
          duplex: 'half',
        }),
      ),
    (error) => error.status === 413,
  )
})
test('managed images require an exact identifier without query strings or fragments', () => {
  const id = '10000000-0000-4000-a000-000000000001'
  assert.equal(managedImageId(`https://www.hackbarna.com/api/media/${id}`), id)
  assert.equal(managedImageId(`/api/media/${id}`), id)
  for (const value of [
    `/api/media/${id}?token=1`,
    `/api/media/${id}#fragment`,
    '/api/media/../secret',
    '/api/media/not-an-id',
  ])
    assert.equal(managedImageId(value), null)
})

test('approved project pictures and explicit removal are consistent across cards and historical video thumbnails', () => {
  const {
    archivedProjectCard,
    submittedProjectCard,
  } = require('../lib/project-cards.ts')
  const { archivedProjectContent } = require('../lib/project-detail.ts')
  const url =
    'https://www.hackbarna.com/api/media/10000000-0000-4000-a000-000000000001'
  const project = {
    slug: 'picture-test',
    content:
      '<YouTube id="Z3qFd-oT8Xo" thumbnail="https://example.test/old.jpg" />',
    data: {
      title: 'Picture test',
      description: 'A test',
      thumbnailUrl: 'https://example.test/old.jpg',
      projectImage: url,
      youtubeLink: '',
      publishedDate: new Date(),
      hackers: [],
      techStack: [],
    },
  }
  assert.equal(archivedProjectCard(project, 'en').image, url)
  assert.equal(archivedProjectContent(project).media.thumbnail, url)
  assert.equal(
    archivedProjectCard(
      { ...project, data: { ...project.data, projectImage: '' } },
      'en',
    ).image,
    undefined,
  )
  const live = {
    eventSlug: 'event',
    slug: 'picture-test',
    name: 'Picture test',
    tagline: 'A test',
    imageUrl: url,
    screenshotKey: 'old',
    videoUrl: null,
    hackers: [],
    creatorName: 'Maker',
    linkedinUrl: '',
    createdAt: new Date(),
  }
  assert.equal(submittedProjectCard(live, 'en', { name: 'Event' }).image, url)
  assert.equal(
    submittedProjectCard({ ...live, imageUrl: '' }, 'en', { name: 'Event' })
      .image,
    undefined,
  )
})
