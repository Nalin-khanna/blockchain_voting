import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [voted, setVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [contractState, setContractState] = useState(0); // 0: Created, 1: Voting, 2: Ended
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [proposal, setProposal] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterAddress, setVoterAddress] = useState("");
  const [finalResult, setFinalResult] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  useEffect(() => {
    if (contract) {
      refreshContractData();
    }
  }, [contract]);

  const refreshContractData = async () => {
    try {
      const state = await contract.state();
      setContractState(state);
      
      const proposal = await contract.proposal();
      setProposal(proposal);
      
      const totalVoters = await contract.totalVoter();
      setTotalVoters(Number(totalVoters));
      
      const totalVotes = await contract.totalVote();
      setTotalVotes(Number(totalVotes));
      
      const ballotOfficialAddress = await contract.ballotOfficialAddress();
      setIsOwner(account.toLowerCase() === ballotOfficialAddress.toLowerCase());
      
      if (state === 2) { // Ended state
        const finalResult = await contract.finalResult();
        setFinalResult(Number(finalResult));
      }
      
      // Check if the current user has already voted
      if (account) {
        const voter = await contract.voterRegister(account);
        setVoted(voter.voted);
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setError("Failed to load ballot data");
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError("");
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install it to continue.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
      
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Reset states when account changes
          setVoted(false);
          setIsOwner(false);
        } else {
          setAccount("");
          setContract(null);
        }
      });

      console.log("Connected account:", address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const addVoter = async () => {
    if (!contract || !isOwner || contractState !== 0) return;
    
    setLoading(true);
    setError("");
    try {
      if (!ethers.isAddress(voterAddress)) {
        setError("Invalid Ethereum address");
        return;
      }
      
      if (!voterName.trim()) {
        setError("Voter name cannot be empty");
        return;
      }
      
      const tx = await contract.addVoter(voterAddress, voterName);
      await tx.wait();
      
      setVoterName("");
      setVoterAddress("");
      refreshContractData();
    } catch (error) {
      console.error("Error adding voter:", error);
      setError("Failed to add voter");
    } finally {
      setLoading(false);
    }
  };

  const startVoting = async () => {
    if (!contract || !isOwner || contractState !== 0) return;
    
    setLoading(true);
    setError("");
    try {
      const tx = await contract.startVote();
      await tx.wait();
      refreshContractData();
    } catch (error) {
      console.error("Error starting voting:", error);
      setError("Failed to start voting");
    } finally {
      setLoading(false);
    }
  };

  const endVoting = async () => {
    if (!contract || !isOwner || contractState !== 1) return;
    
    setLoading(true);
    setError("");
    try {
      const tx = await contract.endVote();
      await tx.wait();
      refreshContractData();
    } catch (error) {
      console.error("Error ending voting:", error);
      setError("Failed to end voting");
    } finally {
      setLoading(false);
    }
  };

  const vote = async (choice) => {
    if (!contract || contractState !== 1 || voted) return;
    
    setLoading(true);
    setError("");
    try {
      const tx = await contract.doVote(choice);
      await tx.wait();
      setVoted(true);
      refreshContractData();
    } catch (error) {
      console.error("Voting failed:", error);
      
      // Check if this is because user is not registered
      if (error.message.includes("revert")) {
        setError("You are not registered to vote or have already voted");
      } else {
        setError("Voting failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStateText = () => {
    switch (contractState) {
      case 0: return "Created";
      case 1: return "Voting in Progress";
      case 2: return "Voting Ended";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-8">
          <h1 className="text-3xl font-bold text-white">Blockchain Voting DApp</h1>
          <p className="text-blue-100 mt-2">
            {proposal ? `Proposal: ${proposal}` : "Connect wallet to see proposal"}
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="p-8">
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div>
              <p className="text-gray-600 mb-1">Status: 
                <span className={`ml-2 font-semibold ${
                  contractState === 0 ? "text-yellow-600" : 
                  contractState === 1 ? "text-green-600" : 
                  "text-red-600"
                }`}>
                  {getStateText()}
                </span>
              </p>
              
              {account && (
                <p className="text-gray-600 text-sm mt-1">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                  {isOwner && <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Manager</span>}
                </p>
              )}
            </div>
            
            <button 
              onClick={connectWallet}
              disabled={loading}
              className={`px-6 py-2 rounded-lg ${
                account ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"
              } font-medium transition-colors duration-200`}
            >
              {account ? "Wallet Connected" : "Connect Wallet"}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Stats */}
          {contract && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Total Voters Registered</p>
                <p className="text-2xl font-bold text-blue-800">{totalVoters}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Total Votes Cast</p>
                <p className="text-2xl font-bold text-blue-800">{totalVotes}</p>
              </div>
              {contractState === 2 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Final Yes Votes</p>
                  <p className="text-2xl font-bold text-green-800">{finalResult}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Manager Section */}
          {isOwner && (
            <div className="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">Manager Controls</h2>
              
              {contractState === 0 && (
                <>
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-gray-700">Add Voters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Voter Address (0x...)"
                        value={voterAddress}
                        onChange={(e) => setVoterAddress(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                      <input
                        type="text"
                        placeholder="Voter Name"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg w-full"
                      />
                    </div>
                    <button
                      onClick={addVoter}
                      disabled={loading || !voterAddress || !voterName}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200"
                    >
                      {loading ? "Processing..." : "Add Voter"}
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <button
                      onClick={startVoting}
                      disabled={loading || totalVoters === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
                    >
                      {loading ? "Processing..." : "Start Voting"}
                    </button>
                    {totalVoters === 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        You need to add at least one voter before starting
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {contractState === 1 && (
                <button
                  onClick={endVoting}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200"
                >
                  {loading ? "Processing..." : "End Voting"}
                </button>
              )}
            </div>
          )}
          
          {/* Voting Section */}
          {contract && contractState === 1 && !isOwner && (
            <div className="p-6 border border-green-200 rounded-lg bg-green-50">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Cast Your Vote</h2>
              
              {voted ? (
                <div className="bg-green-100 border-l-4 border-green-500 p-4">
                  <p className="text-green-700 font-medium">Thank you for voting!</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => vote(true)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
                  >
                    {loading ? "Processing..." : "Vote Yes"}
                  </button>
                  <button
                    onClick={() => vote(false)}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
                  >
                    {loading ? "Processing..." : "Vote No"}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Results Section */}
          {contractState === 2 && (
            <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
              <h2 className="text-xl font-semibold mb-4 text-purple-800">Voting Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-medium text-gray-700 mb-2">Yes Votes</h3>
                  <p className="text-3xl font-bold text-green-600">{finalResult}</p>
                  <p className="text-gray-500 mt-1">
                    {totalVotes > 0 ? `(${((finalResult / totalVotes) * 100).toFixed(1)}%)` : "(0%)"}
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-medium text-gray-700 mb-2">No Votes</h3>
                  <p className="text-3xl font-bold text-red-600">{totalVotes - finalResult}</p>
                  <p className="text-gray-500 mt-1">
                    {totalVotes > 0 ? `(${(((totalVotes - finalResult) / totalVotes) * 100).toFixed(1)}%)` : "(0%)"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  {totalVotes > 0 ? (
                    <div 
                      className="bg-green-600 h-4"
                      style={{ width: `${(finalResult / totalVotes) * 100}%` }}
                    ></div>
                  ) : (
                    <div className="bg-gray-300 h-4 w-0"></div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Yes: {finalResult}</span>
                  <span>No: {totalVotes - finalResult}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Not registered message */}
          {contract && contractState === 1 && !isOwner && !voted && (
            <div className="mt-4 text-sm text-gray-600">
              <p>If you're unable to vote, you may not be registered for this ballot. Please contact the ballot manager.</p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Blockchain Voting DApp powered by Ethereum</p>
      </footer>
    </div>
  );
}

export default App;