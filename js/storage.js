// File: js/storage.js

const STORAGE_KEY = "novatech_award_votes";

function getAllVotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function getVotesForCandidate(candidateId) {
  const all = getAllVotes();
  return all[candidateId] || [];
}

function addVote(candidateId, vote) {
  const all = getAllVotes();
  if (!all[candidateId]) all[candidateId] = [];
  all[candidateId].push(vote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function calcPoints(candidateId) {
  const votes = getVotesForCandidate(candidateId);
  return votes.reduce((sum, v) => {
    const pos = POSITION_POINTS[v.position];
    return sum + (pos ? pos.points : 1);
  }, 0);
}

function calcVoteCount(candidateId) {
  return getVotesForCandidate(candidateId).length;
}
