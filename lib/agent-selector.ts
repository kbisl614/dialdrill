/**
 * Agent selection utility
 * Randomly selects one of the configured ElevenLabs agents
 */

const DEFAULT_AGENT_IDS = [
  'agent_6701kchmqsvdfbatrfm00qe5xjgj', // Eric
  'agent_4201kchpssmrfs0v6zrqt7g99dmq', // The Wolf
];

export function getRandomAgentId(): string {
  const agentIdsString = process.env.ELEVENLABS_AGENT_IDS;

  let agentIds: string[];

  if (agentIdsString) {
    // Parse from environment variable
    agentIds = agentIdsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }

  // Fallback to defaults if empty or not configured
  if (!agentIds || agentIds.length === 0) {
    agentIds = DEFAULT_AGENT_IDS;
  }

  // Randomly select one
  const randomIndex = Math.floor(Math.random() * agentIds.length);
  return agentIds[randomIndex];
}

export function isMockMode(): boolean {
  return process.env.ELEVENLABS_MOCK === '1';
}
