import React, { useState, useContext, useEffect, useRef } from 'react'
import colorContext from '../context/bgColor/colorContext';
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../css/home.css'
import logo from "../assets/logo.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Alert from './Alert';

const Home = (props) => {

  const host = process.env.REACT_APP_API;

  const [voterEmail, setEmail] = useState({ email: "" });
  const [voterId, setId] = useState({ voterId: "" });
  const [password, setPassword] = useState({ password: "" });

  const [svoterName, setSName] = useState({ sname: "" });
  const [svoterEmail, setSEmail] = useState({ semail: "" });
  const [spassword, setSPassword] = useState({ spassword: "" });
  const [image, setImage] = useState(null);

  // Admin 
  const [adminEmail, setAdminEmail] = useState({ email: "" });
  const [adminPassword, setAdminPassword] = useState({ password: "" });
  const [adminName, setAdminName] = useState({ name: "" });
  const [adminImage, setAdminImage] = useState(null);

  const [adminSEmail, setAdminSEmail] = useState({ email: "" });
  const [adminSPassword, setAdminSPassword] = useState({ password: "" });

  const [clicked, setClicked] = useState(false);
  const [status, setStatus] = useState("login");

  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({
      message: message,
      type: type
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const context = useContext(colorContext);
  const { mode } = context;
  let history = useNavigate();
  const [activeTab, setActiveTab] = useState('Tab1');
  const [activePage, setActivePage] = useState('login');
  const [activeAdminPage, setActiveAdminPage] = useState('login');

  const handleVoterLogin = (e) => {
    e.preventDefault();
    setClicked(true);
    axios.post(`${host}/loginvoter`, { id: voterId.voterId, email: voterEmail.email, password: password.password })
      .then(res => {
        let response = res.data;
        if (response.message === "Login Successful") {
          setStatus("redirect");
          showAlert("Login Successful. Sending Otp to your E-Mail", "success");
          axios.post(`${host}/sendvoterotp`, { voterId: voterId.voterId })
            .then(res => {
              if (res.data === "OTP sent") {
                props.setVoterOtp("invalid");
                setClicked(false);
                setStatus("login");
                history("/otp");

              }
              else {

                showAlert("Error sending OTP check Credentials", "danger");
                setClicked(false);
              }
            })
            .catch(err => {
              setClicked(false);
              props.setVoterOtp("valid");
              history("/otp");
            })
          props.onOtpClick(voterId.voterId);
        }

      })
      .catch(err => {
        setClicked(false);
        showAlert("Invalid Credentials", "danger");
      })
  }



  const onChange = (e) => {
    setEmail({ ...voterEmail, [e.target.name]: e.target.value });
    setId({ ...voterId, [e.target.name]: e.target.value });
    setPassword({ ...password, [e.target.name]: e.target.value });
  }

  const onSChange = (e) => {
    setSName({ ...svoterName, [e.target.name]: e.target.value });
    setSEmail({ ...svoterEmail, [e.target.name]: e.target.value });
    setSPassword({ ...spassword, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };

  const handleAdminImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAdminImage(reader.result);
    };
  };

  const handleSignUpAdd = (e) => {
    e.preventDefault();
    setClicked(true);

    if (!validatePassword(spassword.spassword)) {
      setClicked(false);
      showAlert("Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.", "danger");
      return;
    }

    const formData = {
      "voterName": svoterName.sname,
      "voterEmail": svoterEmail.semail,
      "voterPassword": spassword.spassword,
      "signup": "true",
      "voterImage": image
    }

    if (formData.voterPassword.length < 8) {
      setClicked(false);
      showAlert("Password Should be minimum 8 characters", "danger");
      return
    }
    console.log(formData.image);
    if (formData.image === null) {
      setClicked(false);
      showAlert("Please upload your image", "danger");
      return
    }

    console.log(formData);
    axios.post(`${host}/createvoter`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.data.message === "Otp sent") {
          showAlert("Sent Verification link to your e-mail", "success");
          setClicked(false);
          handlePage("login");
        }
      })
      .catch((error) => {
        setClicked(false);
        showAlert("Email already exists", "danger");
      });
  }

  const openTab = (tabName) => {
    if (activeTab !== tabName) {
      setActiveTab(tabName);
    }
  };

  const handlePage = (page) => {
    if (activePage !== page) {
      setActivePage(page);
    }
  }

  const handleAdminPage = (page) => {
    if (activeAdminPage !== page) {
      setActiveAdminPage(page);
    }
  }

  const onSAdminChange = (e) => {
    setAdminSEmail({ ...adminSEmail, [e.target.name]: e.target.value });
    setAdminSPassword({ ...adminSPassword, [e.target.name]: e.target.value });
    setAdminName({ ...adminName, [e.target.name]: e.target.value });
  }

  const onAdminChange = (e) => {
    setAdminEmail({ ...adminEmail, [e.target.name]: e.target.value });
    setAdminPassword({ ...adminPassword, [e.target.name]: e.target.value });
  }

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setClicked(true);
    axios.post(`${host}/loginadmin`, { email: adminEmail.email, password: adminPassword.password })
      .then(res => {
        let response = res.data;
        if (response.message === "Login Successful") {

          showAlert("Login Successful. Sending Otp to your E-Mail", "success");
          setStatus("redirect");
          axios.post(`${host}/sendadminotp`, { adminId: adminEmail.email })
            .then(res => {
              if (res.data === "OTP sent") {
                props.setAdminOtp("invalid");
                setClicked(false);
                setStatus("login");
                history("/adminotp");
              }
              else {
                setClicked(false);
                showAlert("Error sending OTP check Credentials", "danger");
              }
            })
            .catch(err => {
              props.setAdminOtp("valid");
              showAlert("Previous Otp is Still Valid", "success");
              history("/adminotp");

            })
          props.onAdminOtpClick(adminEmail.email);
        }
        else {
          setClicked(false);
          showAlert("Invalid Credentials", "danger");
        }
      })
      .catch(err => {
        setClicked(false);
        showAlert("Invalid Credentials", "danger");
      })
  }

  const toastRef = useRef(null);

  const handleSignUpAdmin = (e) => {
    e.preventDefault();
    setClicked(true);

    if (!validatePassword(adminSPassword.password)) {
      setClicked(false);
      showAlert("Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.", "danger");
      return;
    }

    if (adminSPassword.password.length < 8) {
      setClicked(false);
      showAlert("Password Should be minimum 8 characters", "danger");
      return
    }
    axios.post(`${host}/createadmin`, { name: adminName.name, email: adminSEmail.email, password: adminSPassword.password, image: adminImage })
      .then(res => {
        if (res.data.message === "Link sent") {
          showAlert("Verification Link Sent to Email", "success");
          setClicked(false);
          handleAdminPage("login");
        }
      })
      .catch((error) => {
        showAlert("Email already exists", "danger");
        setClicked(false);
      });
  }

  const refresh = localStorage.getItem("refresh");
  let access = localStorage.getItem("access");

  const headers = {
    'Content-Type': 'application/json',
    "Authorization": access
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${host}/token/refresh/`, { refresh: refresh });
      let accessToken = response.data.access;
      localStorage.setItem('access', accessToken);
      headers.Authorization = `${accessToken}`;
    } catch (error) {
      console.log("Error accessing the token");
    }
  }

  useEffect(() => {
    if (localStorage.getItem('access')) {
      axios.get(`${host}/getuser`, { headers: headers })
        .then(res => {
          if (res.data.role === "Administrator") {
            history("/adminelection");
          }
          else if (res.data.role === "voter") {
            history("/election");
          }

        })
        .catch(err => {

          refreshToken()
            .then(res => {
              axios.get(`${host}/getuser`, { headers: headers })
                .then(res => {
                  if (res.data.role === "Administrator") {
                    history("/adminelection");
                  }
                  else if (res.data.role === "voter") {
                    history("/election");
                  }

                })
                .catch(err => { console.log(err); })
            })
            .catch(err => { console.log(err); })
        })
    }
    // eslint-disable-next-line
  }, [])




  return (
    <>

      <Alert alert={alert} size={"full"} />
      <div className="home">
        <div className={`homeImage mode-${mode}`}></div>
        <div className={`home-box mode-${mode}`}>
          <div className="tab">
            <div className="home-tab-buttons">
              <Link className={activeTab === 'Tab1' ? `tablinks active mode-${mode}` : `tablinks mode-${mode}`} onClick={() => openTab('Tab1')} >
                Voter
              </Link>
              <Link className={activeTab === 'Tab2' ? `tablinks active mode-${mode}` : `tablinks mode-${mode}`} onClick={() => openTab('Tab2')} >
                Admin
              </Link>
            </div>
            <div className="tabcontent-container">
              <div id="Tab1" className={`tabcontent ${activeTab === 'Tab1' ? 'show left-to-right' : 'left-to-right'}`} >
                <div className="content">
                  <form id='login' className={`voter-form ${activePage === "login" ? 'show' : 'hide'}`}>
                    <h4>Login</h4>
                    <div className="mb-3">
                      <label htmlFor="id" className="form-label">Enter UserId : </label>
                      <input type="text" className="form-control" id="voterId" name='voterId' onChange={onChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter Email : </label>
                      <input type="email" className="form-control" id="email" name='email' onChange={onChange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter password : </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="password"
                          name='password'
                          onChange={onChange}
                          aria-describedby="emailHelp"
                        />
                        <span id="pass-span" className="input-group-text" onClick={togglePasswordVisibility}>
                          <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </span>
                      </div>
                    </div>
                    <div className="signupprompt">
                      <label htmlFor="signup">Don't have an account ? &nbsp;</label>
                      <Link style={{ textDecoration: 'none', color: "rgb(96, 174, 252)" }} onClick={() => handlePage('signup')}>Sign Up</Link>
                    </div>
                    <div className="log">
                      <button disabled={clicked || voterEmail.email.length < 1 || voterId.voterId.length < 1 || password.password.length < 1} type="submit" className={status === "login" ? "btn btn-primary" : "btn btn-success"} onClick={handleVoterLogin}>
                        {
                          clicked ?
                            <>
                              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                              <span role="status">{status === "login" ? " Logging In..." : " Redirecting..."}</span>
                            </>
                            : "Login"
                        }
                      </button>

                    </div>
                  </form>
                  {/* ####################### Voter Signup ##########################3 */}
                  <form id='signup' method='post' className={`voter-form ${activePage === "signup" ? 'show' : 'hide'}`}>
                    <h4>Sign Up</h4>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Enter Name : </label>
                      <input type="text" className="form-control" id="name" name='sname' onChange={onSChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter Email : </label>
                      <input type="email" className="form-control" id="semail" name='semail' onChange={onSChange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter password : </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="spassword"
                          name='spassword'
                          onChange={onSChange}
                          aria-describedby="emailHelp"
                        />
                        <span id="pass-span" className="input-group-text" onClick={togglePasswordVisibility}>
                          <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="formFileSm" className="form-label">Upload Image : </label>
                      <input className="form-control form-control-sm" onChange={handleImageChange} id="formFileSm" type="file" />
                    </div>
                    <div className="signinprompt">
                      <label htmlFor="signin">Already have an account ? &nbsp;</label>
                      <Link style={{ textDecoration: 'none', color: "rgb(96, 174, 252)" }} onClick={() => handlePage('login')}>Login</Link>
                    </div>
                    <div className="log">
                      <button disabled={clicked || svoterName.sname < 1 || svoterEmail.semail < 1 || spassword.spassword < 1 || image === null} type="submit" className={status === "login" ? "btn btn-primary" : "btn btn-success"} onClick={handleSignUpAdd}>
                        {
                          clicked ?
                            <>
                              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                              <span role="status">Please Wait...</span>
                            </>
                            : "Sign Up"
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* #################################     Admin  ################################## */}
              <div id="Tab2" className={`tabcontent ${activeTab === 'Tab2' ? 'show right-to-left' : 'right-to-left'}`} >
                <div className="content">
                  <form id='adminlogin' className={`admin-form ${activeAdminPage === "login" ? 'show' : 'hide'}`}>
                    <h4>Login</h4>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter Email : </label>
                      <input type="email" className="form-control" id="aemail" name='email' onChange={onAdminChange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter password : </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="apassword"
                          name='password'
                          onChange={onAdminChange}
                          aria-describedby="emailHelp"
                        />
                        <span id="pass-span" className="input-group-text" onClick={togglePasswordVisibility}>
                          <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </span>
                      </div>
                    </div>
                    <div className="signupprompt">
                      <label htmlFor="signup">Don't have an account ? &nbsp;</label>
                      <Link style={{ textDecoration: 'none', color: "rgb(96, 174, 252)" }} onClick={() => handleAdminPage('signup')}>Sign Up</Link>
                    </div>
                    <div className="log">
                      <button disabled={clicked || adminEmail.email.length < 1 || adminPassword.password.length < 1} type="submit" className={status === "login" ? "btn btn-primary" : "btn btn-success"} onClick={handleAdminLogin}>
                        {
                          clicked ?
                            <>
                              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                              <span role="status">{status === "login" ? " Logging In..." : " Redirecting..."}</span>
                            </>
                            : "Login"
                        }
                      </button>
                    </div>
                  </form>
                  {/* ####################### Admin Signup ##########################3 */}
                  <form id='adminsignup' method='post' className={`admin-form ${activeAdminPage === "signup" ? 'show' : 'hide'}`}>
                    <h4>Sign Up</h4>

                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Enter Name : </label>
                      <input type="text" className="form-control" id="adminName" name='name' onChange={onSAdminChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter Email : </label>
                      <input type="email" className="form-control" id="saemail" name='email' onChange={onSAdminChange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Enter password : </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="sapassword"
                          name='password'
                          onChange={onSAdminChange}
                          aria-describedby="emailHelp"
                        />
                        <span id="pass-span" className="input-group-text" onClick={togglePasswordVisibility}>
                          <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </span>
                      </div>

                    </div>
                    <div className="mb-3">
                      <label htmlFor="formFileSm" className="form-label">Upload Image : </label>
                      <input className="form-control form-control-sm" onChange={handleAdminImageChange} id="formFileSm" type="file" />
                    </div>
                    <div className="signinprompt">
                      <label htmlFor="signin">Already have an account ? &nbsp;</label>
                      <Link style={{ textDecoration: 'none', color: "rgb(96, 174, 252)" }} onClick={() => handleAdminPage('login')}>Login</Link>
                    </div>
                    <div className="log">
                      <button disabled={clicked || adminSEmail.email < 1 || adminSPassword.password < 1} type="submit" className={status === "login" ? "btn btn-primary" : "btn btn-success"} onClick={handleSignUpAdmin}>
                        {
                          clicked ?
                            <>
                              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                              <span role="status">Please Wait...</span>
                            </>
                            : "Sign Up"
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button type="button" className="btn btn-primary d-none" id="liveToastBtn">
          Show live toast
        </button>

        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div ref={toastRef} id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <img src={`${logo}`} className="rounded me-2" alt="..." />
              <strong className="me-auto">Online Voter</strong>
              <small>2's ago</small>
              <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div className="toast-body">
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Home
