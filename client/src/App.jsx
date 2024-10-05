
import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { Alert, Container, Row, Toast, ToastBody } from 'react-bootstrap/';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import API from './API.js';

import Header from "./components/Header.jsx";
import { LoginForm } from "./components/AuthComponents.jsx";
import HomePage from "./components/HomePage.jsx";
import FeedbackContext from "./contexts/FeedbackContext.js"
import { NotFoundLayout, PageLayout } from './components/PageLayout.jsx';
import SingleRoundGame from './components/SingleRoundGame.jsx';
import GameOverPage from './components/GameOver.jsx';
import MultiRoundGame from './components/MultiRoundGame.jsx';
import History from './components/History.jsx';
import SingleGameHistory from './components/SingleGameHistory.jsx';

function App() {

    const [loggedIn, setLoggedIn] = useState(false); // NEW loggato?
    const [message, setMessage] = useState(''); // NEW messaggi errore?
    const [user, setUser] = useState(''); // NEW info stato?
    const navigate = useNavigate();


    const [feedback, setFeedback] = useState('');
    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknow Error"
        setFeedback(message);
    }


    useEffect(() => {
        // Checking if the user is already logged-in
        // This useEffect is called only the first time the component is mounted (i.e., when the page is (re)loaded.)
        API.getUserInfo()
            .then(user => {
                setLoggedIn(true);  // setting the state to logged-in
                setUser(user);  // here you have the user info, if already logged in
            }).catch(e => {
                if (loggedIn)    // printing error only if the state is inconsistent (i.e., the app was configured to be logged-in)
                    setFeedbackFromError(e);
                setLoggedIn(false); setUser(null);
            });
    }, [loggedIn]);


    const handleLogin = async (credentials) => {
        const user = await API.logIn(credentials);
        setUser(user); setLoggedIn(true);
        setFeedback("Welcome, "+user.name);
    };

    const handleLogout = async () => {
        await API.logOut();
        setLoggedIn(false);
        setMessage('');
        setUser('');
        navigate('/');
        setFeedback("Bye Bye, "+user.name);

    };

    return (
        <Routes>
            <Route element={
                <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
                    <div className="min-vh-100 d-flex flex-column">
                        <Header loggedIn={loggedIn} logout={handleLogout} />
                        <Container fluid className="flex-grow-1 d-flex flex-column">
                            <Row className='flex-grow-1'>
                                <Outlet />
                            </Row>

                            <Toast
                                show={feedback !== ''}
                                autohide
                                onClose={() => setFeedback('')}
                                delay={4000}
                                position="top-end"
                                className="position-fixed end-0 m-3"
                            >
                                <ToastBody>
                                    {feedback}
                                </ToastBody>
                            </Toast>
                        </Container>
                    </div>
                </FeedbackContext.Provider>

            }>
                <Route
                    path="/" element={ 

                        <PageLayout
                            loggedIn={loggedIn} />
                    }>
                    <Route path="*" element={<NotFoundLayout />} />
                    <Route index element={ <HomePage loggedIn={loggedIn} />
                    }
                    />
                </Route>
                <Route path="single-round-game" element={
                    <SingleRoundGame />
                } />
                <Route path="multi-round-game" element={
                    !loggedIn ? <Navigate replace to='/login' />
                    : <MultiRoundGame user={user.id}/>
                } />
                <Route path="/game-over" element={<GameOverPage />} />
                <Route path="profile" element={
                    !loggedIn ? <Navigate replace to='/login' />
                        : <History user={user} />
                } />
                <Route path="game/:gameId" element={
                    !loggedIn ? <Navigate replace to='/login' />
                        : <SingleGameHistory user={user} />
                } />
                <Route path="/login" element={ /* If the user is ALREADY logged-in, redirect to root */
                    loggedIn ? <Navigate replace to='/' />
                        : <LoginForm login={handleLogin} />
                } />
            </Route>
        </Routes>

    );

}

export default App
