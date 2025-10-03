const { v4: uuidv4 } = require('uuid');

const stories = new Map(); // storyId -> story
const loreByStoryId = new Map(); // storyId -> loreIndex

function createStory({ title, prompt, params, rootSegment }) {
  const storyId = uuidv4();
  const rootNodeId = uuidv4();
  const nodes = new Map();
  nodes.set(rootNodeId, {
    id: rootNodeId,
    text: rootSegment.text,
    choices: rootSegment.choices.map((c) => ({ label: c.label, to: null })),
  });
  const story = {
    id: storyId,
    title: title || 'Untitled Story',
    prompt,
    params,
    rootNodeId,
    nodes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  stories.set(storyId, story);
  return { storyId, rootNodeId };
}

function getStory(storyId) {
  return stories.get(storyId) || null;
}

function getNode(storyId, nodeId) {
  const story = getStory(storyId);
  if (!story) return null;
  return story.nodes.get(nodeId) || null;
}

function appendChildNode(storyId, parentNodeId, childSegment, selectedChoiceLabel) {
  const story = getStory(storyId);
  if (!story) return null;
  const parent = story.nodes.get(parentNodeId);
  if (!parent) return null;

  const childNodeId = uuidv4();
  story.nodes.set(childNodeId, {
    id: childNodeId,
    text: childSegment.text,
    choices: childSegment.choices.map((c) => ({ label: c.label, to: null })),
  });

  // link the matching choice on parent to the new child
  const idx = parent.choices.findIndex((c) => c.label === selectedChoiceLabel);
  if (idx >= 0) {
    parent.choices[idx].to = childNodeId;
  } else {
    // if not found, append a new linkage with the provided label
    parent.choices.push({ label: selectedChoiceLabel || 'Continue', to: childNodeId });
  }
  story.updatedAt = Date.now();
  return { childNodeId };
}

function setLore(storyId, loreIndex) {
  loreByStoryId.set(storyId, loreIndex);
  return true;
}

function getLore(storyId) {
  return loreByStoryId.get(storyId) || null;
}

function exportStory(storyId) {
  const story = getStory(storyId);
  if (!story) return null;
  const nodes = Array.from(story.nodes.values());
  return {
    id: story.id,
    title: story.title,
    prompt: story.prompt,
    params: story.params,
    rootNodeId: story.rootNodeId,
    nodes,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  };
}

function importStory(storyJson) {
  const storyId = uuidv4();
  const nodes = new Map();
  for (const node of storyJson.nodes || []) {
    nodes.set(node.id, { id: node.id, text: node.text, choices: node.choices || [] });
  }
  const story = {
    id: storyId,
    title: storyJson.title || 'Imported Story',
    prompt: storyJson.prompt || '',
    params: storyJson.params || {},
    rootNodeId: storyJson.rootNodeId,
    nodes,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  stories.set(storyId, story);
  return { storyId };
}

module.exports = {
  createStory,
  getStory,
  getNode,
  appendChildNode,
  setLore,
  getLore,
  exportStory,
  importStory,
};
