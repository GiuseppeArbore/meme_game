import { useState, useEffect, useRef } from 'react';
import {Container, Row, Col, Card, Button, Alert, Spinner, ProgressBar} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API.js';
import { UnauthorizedError } from '../API.js';
import '../App.css';
import PropTypes from 'prop-types';
import FeedbackContext from '../contexts/FeedbackContext.js';

function MultiRoundGame(props) {
    const { user } = props;
    const [memes, setMemes] = useState([]);
    const [mscaptions, setMsCaptions] = useState([]);
    const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
    const [selectedCaption, setSelectedCaption] = useState(null);
    const [correctCaptions, setCorrectCaptions] = useState([]);
    const [message, setMessage] = useState('');
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeExceded, setTimeExceded] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null); // Ref per il timer

    useEffect(() => {
        const fetchMemesAndCaptions = async () => {
            try {
                setLoading(true);
                const { memes, mscaptions } = await API.getMultiRoundMeme();
                setMemes(memes);
                setMsCaptions(mscaptions);
                setLoading(false);
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    navigate('/not-authorized');
                } else {
                    setMessage({ msg: `Error loading memes and captions: ${err.message}`, type: 'danger' });
                    FeedbackContext.setErrorFeedback(`Error loading memes and captions: ${err.message}`);
                }
            }
        };

        fetchMemesAndCaptions();
    }, [user, navigate]);

    useEffect(() =>{
        async function fetchData() {
            if (selectedCaption !== null) {
                const currentMeme = memes[currentMemeIndex];
                const currentCaptions = mscaptions[currentMemeIndex];
    
                const cor = await API.getCorrectCaptions(currentMeme.id);
                const filtered = cor.filter(c => currentCaptions.some(cap => cap.id === c.id));
                setCorrectCaptions(filtered);
    
                const isCorrect = filtered.some(c => c.id === selectedCaption.id);
                setIsCorrect(isCorrect);
                
                if (isCorrect) {
                    setPoints(prevPoints => prevPoints + 5);
                }
    
                const updatedHistory = [
                    ...history,
                    { meme: currentMeme, caption: selectedCaption, isCorrect, correctCaptions: filtered }
                ];
    
                setHistory(updatedHistory);
                setShowResult(true);
    
                clearTimeout(timerRef.current);
    
                const resultTimeout = isCorrect ? 1000 : 2500;
                setTimeout(() => {
                    setShowResult(false);
                    if (currentMemeIndex < 2) {
                        setCurrentMemeIndex(currentMemeIndex + 1);
                        setSelectedCaption(null);
                        setMessage('');
                        setTimeLeft(30);
                    } else {
                        saveGame(points + (isCorrect ? 5 : 0), updatedHistory);
                    }
                }, resultTimeout);
            }
        }
        fetchData();
    }, [selectedCaption]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerRef.current);
        } else {
            setTimeExceded(true);
            handleTimeOut();
        }
    }, [timeLeft]);

    const handleCaptionSelect = async (caption) => {
        setSelectedCaption(caption);
    };

    const handleTimeOut = async () => {
        const currentMeme = memes[currentMemeIndex];
        const currentCaptions = mscaptions[currentMemeIndex];
    
        const cor = await API.getCorrectCaptions(currentMeme.id);
        const filtered = cor.filter(c => currentCaptions.some(cap => cap.id === c.id));
        setCorrectCaptions(filtered);

        const updatedHistory = [
            ...history,
            { meme: currentMeme, caption: null, isCorrect: false, correctCaptions: filtered }
        ];

        setHistory(updatedHistory);
        setShowResult(true);
        clearTimeout(timerRef.current);

        setTimeout(() => {
            setShowResult(false);
            setTimeExceded(false);
            if (currentMemeIndex < 2) {
                setCurrentMemeIndex(currentMemeIndex + 1);
                setSelectedCaption(null);
                setMessage('');
                setTimeLeft(30);
            } else {
                saveGame(points, updatedHistory);
            }
        }, 2500);
    };

    const saveGame = async (finalPoints, finalHistory) => {
        try {
            const rounds = await finalHistory.map((round, index) => ({
                meme: round.meme,
                isCorrect: round.isCorrect,
                round_number: index + 1
            }));

            await API.createMultiRoundGame(user, rounds, finalPoints);
            navigate('/game-over', { state: { points: finalPoints, history: finalHistory, timeout: false, isMultiRound: true, user } });
        } catch (err) {
            setMessage({ msg: `Error saving game: ${err.message}`, type: 'danger' });
        }
    };

    if (loading) {
        return (
            <Container className="mt-3">
                <Row className="justify-content-center">
                    <Spinner animation="border" />
                </Row>
            </Container>
        );
    }


    return (
        <Container className='py-md-4'>
            {message && <Row><Alert variant={message.type}>{message.msg}</Alert></Row>}
            <Row className="justify-content-center">
                <Col md={8}>
                    {showResult && !timeExceded &&(
                        <Alert variant={isCorrect ? 'success' : 'danger'} className="mt-3">
                            {isCorrect
                                ? 'Correct! 🎉✅'
                                : (
                                    <>
                                        Incorrect! ❌<br />
                                        The correct captions were:
                                        <ul>
                                            {correctCaptions.map(c => (
                                                <li key={c.id}>{c.text}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                        </Alert>
                    )}
                    {showResult && timeExceded &&(
                        <Alert variant={'danger'} className="mt-3">
                                    <>
                                        Time is up! 🕒  <br />
                                        The correct captions were:
                                        <ul>
                                            {correctCaptions.map(c => (
                                                <li key={c.id}>{c.text}</li>
                                            ))}
                                        </ul>
                                    </>
                        </Alert>
                    )}
                    <h1>Select the best caption for this meme</h1>
                    <Card  className="large-card">
                        <div className="timer">{timeLeft}s</div>
                        <ProgressBar now={(timeLeft / 30) * 100} className="mb-2" />
                        <Card.Img variant="top" src={`http://localhost:3001/${memes[currentMemeIndex].immagine}`} className="centered-img small-card" />
                        <Card.Body>
                            <Row>
                                {mscaptions[currentMemeIndex].map((caption, index) => (
                                    <Col key={`${caption.id}-${index}`} md={6} className="mb-3">
                                        <Button
                                            variant={selectedCaption === caption ? 'primary' : 'outline-primary'}
                                            onClick={() => handleCaptionSelect(caption)}
                                            className="btn-block"
                                            disabled={!!selectedCaption}
                                        >
                                            {caption.text}
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

}

MultiRoundGame.propTypes = {
    user: PropTypes.number.isRequired
};

export default MultiRoundGame;
