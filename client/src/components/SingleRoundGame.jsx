import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API';
import '../App.css';


function SingleRoundGame() {
    const [meme, setMeme] = useState(null);
    const [captions, setCaptions] = useState([]);
    const [selectedCaption, setSelectedCaption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeExceded, setTimeExceded] = useState(false);
    const [message, setMessage] = useState('');
    const [correctCaptions, setCorrectCaptions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(true);
    const [showResult, setShowResult] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchMemeAndCaptions = async () => {
            try {
                const { meme, captions } = await API.getSingleRoundMeme();
                setMeme(meme);
                setCaptions(captions);

                setLoading(false);
            } catch (err) {
                setMessage({ msg: `Error loading meme and captions: ${err.message}`, type: 'danger' });
                setLoading(false);
            }
        };

        fetchMemeAndCaptions();
    }, []);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerRef.current);
        } else {
            setTimeExceded(true);
            handleTimeOut();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const handleCaptionSelect = async (caption) => {
        try {
            setSelectedCaption(caption);
            setShowResult(true);
            clearTimeout(timerRef.current);


            const cor = await API.getCorrectCaptions(meme.id);

            const filtered = cor.filter(c => captions.some(cap => cap.id === c.id));
            setCorrectCaptions(filtered);
            const isValid = await filtered.some(c => c.id === caption.id);
            setIsCorrect(isValid);
  

            if (isValid) {
                setTimeout(() => {
                    navigate('/game-over', { state: { points:5, meme, selectedCaption, correctCaptions, timeout: false, isMultiRound: false } });
                }, 2000);
            } else {
                setTimeout(() => {
                    setShowResult(false);
                    navigate('/game-over', { state: { points:0 , meme, selectedCaption, correctCaptions, timeout: false, isMultiRound: false } });
                }, 3000);
            }

        } catch (error) {
            setMessage({ msg: `Error checking caption: ${error.message}`, type: 'danger' });
        }
    };


    const handleTimeOut = async () => {
        const cor = await API.getCorrectCaptions(meme.id);
        const filtered = cor.filter(c => captions.some(cap => cap.id === c.id));
        setCorrectCaptions(filtered);
        setShowResult(true);
        setTimeout(() => {
            setShowResult(false);
            setTimeExceded(false);
            navigate('/game-over', { state: { points:0 , meme, selectedCaption, correctCaptions, timeout: false, isMultiRound: false } });
        }, 3000);
        };

    return (
        <Container className='py-md-4'>
            {message && <Row><Alert variant={message.type}>{message.msg}</Alert></Row>}
            {loading ? (
                <Row className="justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Row>
            ) : (
                meme && (
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
                            {showResult && timeExceded && (
                                <Alert variant={isCorrect ? 'success' : 'danger'} className="mt-3">
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
                            <Card className="large-card">
                                <div className="timer">{timeLeft}s</div>
                                <ProgressBar now={(timeLeft / 30) * 100} className="mb-2" />
                                <Card.Img variant="top" src={`http://localhost:3001/${meme.immagine}`} className="small-card" />
                                <Card.Body>
                                    <Row>
                                        {captions.map((caption, index) => (
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
                )
            )}
        </Container>
    );
}

export default SingleRoundGame;