export const PROJECT_LIST = [
  {
    slug: "peripheral-nerve-regeneration-genes",
    title: "Peripheral Nerve Regeneration",
    description: "Exploring gene regulation in peripheral nerve repair.",
  },
];
export function getAllProjects() {
  return PROJECT_LIST;
}

export function getProjectBySlug(slug: string) {
  return PROJECT_LIST.find((p) => p.slug === slug) || null;
}
