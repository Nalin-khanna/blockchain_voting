export const CONTRACT_ADDRESS = "0x38f906D6ae2d7913b6219fe179cc5A3f4c2Eb6Fc";

export const CONTRACT_ABI = [
    {
      "inputs": [
        { "internalType": "string", "name": "_ballotofficalName", "type": "string" },
        { "internalType": "string", "name": "_proposal", "type": "string" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_voterAdress", "type": "address" },
        { "internalType": "string", "name": "_voterName", "type": "string" }
      ],
      "name": "addVoter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bool", "name": "_choice", "type": "bool" }],
      "name": "doVote",
      "outputs": [{ "internalType": "bool", "name": "voted", "type": "bool" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endVote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ballotOfficialAddress",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ballotOfficalName",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "finalResult",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proposal",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "state",
      "outputs": [{ "internalType": "enum Ballot.State", "name": "", "type": "uint8" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalVoter",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalVote",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "voterRegister",
      "outputs": [
        { "internalType": "string", "name": "voterName", "type": "string" },
        { "internalType": "bool", "name": "voted", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];