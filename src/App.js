import './App.css';
import { React, useState } from 'react'
import Home from './components/Home';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ColorState from './context/bgColor/ColorState';
import Election from './components/VoterComponents/Election';
import EditElection from './components/AdminComponents/EditElection';
import AddElection from './components/AdminComponents/AddElection';
import FaceVerify from './components/VoterComponents/FaceVerify';
import AddCandidates from './components/AdminComponents/AddCandidates';
import AdminElections from './components/AdminComponents/AdminElections';
import Otp from './components/VoterComponents/Otp';
import VoterSignupOtp from './components/VoterComponents/VoterSignupOtp';
import AdminOtp from './components/AdminComponents/AdminOtp';
import VotePage from './components/VoterComponents/VotePage';
import VoterResults from './components/VoterComponents/VoterResults';
import AlreadyVoted from './components/VoterComponents/AlreadyVoted';


function App() {

  const [voterId, setVoterId] = useState({ voterId: "" });
  const [voterOtp, setVoterOtp] = useState("invalid");
  const [adminId, setAdminId] = useState({ adminId: "" });
  const [admin, setAdmin] = useState({ admin: "" });
  const [adminOtp, setAdminOtp] = useState("invalid");
  const [title, setTitle] = useState({ title: "" });
  const [election, setElection] = useState({});
  const [electionId, setElectionId] = useState({ electionId: "" });


  const handleFaceVerifyClick = (voterId) => {
    setVoterId(voterId);

  };

  const handleOtpClick = (voterId) => {
    setVoterId(voterId);
  }

  const handleAdminOtpClick = (adminId) => {
    setAdminId(adminId);
  }

  const handleGetCandidtes = (title, admin, electionId) => {
    setAdmin(admin);
    setTitle(title);
    setElectionId(electionId);
  }

  const handleElection = (election) => {
    setElection(election);
  }

  const handleBackClick = () => {
    setVoterId({ voterId: "" });
  };

  return (
    <ColorState>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home onFaceVerifyClick={handleFaceVerifyClick} onAdminOtpClick={handleAdminOtpClick} onOtpClick={handleOtpClick} setAdminOtp={setAdminOtp} setVoterOtp={setVoterOtp} />} />
          <Route path="/election" element={<Election handleElection={handleElection} voterId={voterId} handleCandidate={handleGetCandidtes} />} />
          <Route path="/adminelection" element={<AdminElections handleElection={handleElection} />} />
          <Route path="/editelection" element={<EditElection election={election} />} />
          <Route path="/addelection" element={<AddElection />} />
          <Route path="/addcandidates" element={<AddCandidates />} />
          <Route path='/faceverify' element={<FaceVerify voterId={voterId} onBackClick={handleBackClick} />} />
          <Route path="/castvote" element={<VotePage admin={admin} title={title} electionId={electionId} />} />
          <Route path="/checkvoted" element={<AlreadyVoted />} />
          <Route path="/otp" element={<Otp voterId={voterId} valid={voterOtp} />} />
          <Route path="/votersignupotp" element={<VoterSignupOtp />} />
          <Route path="/adminotp" element={<AdminOtp adminId={adminId} valid={adminOtp} />} />
          <Route path="/results" element={<VoterResults election={election} />} />
        </Routes>
      </Router>
    </ColorState>
    
  );
}

export default App;
