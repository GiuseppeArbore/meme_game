import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import "../App.css";

function GameOverPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { points, history, isMultiRound, user } = location.state || { points: 0, history: [], isMultiRound: false, user: null };

    const handleNewGame = () => {
        navigate(isMultiRound ? '/multi-round-game' : '/single-round-game');
    };

    const correctlyGuessedMemes = history? history.filter(entry => entry.isCorrect) : []

    return (
        <Container className="text-center mt-5">
            <Row className="justify-content-center">
                <Col md={4} className="fixed-col">
                    <h1 className="mb-4">Game Over</h1>
                    <h2 className="mb-4">Your Points: {points}</h2>
                    <Button variant="primary" onClick={handleNewGame} className="mb-4">Start New Game</Button>
                </Col>
                <Col md={8} className="scroll-col">
                    {user ? (
                        <div>
                            {correctlyGuessedMemes.length > 0 ? (
                                <div>
                                <h3 className="mb-4">Correctly Guessed Memes</h3>

                                <ul className="list-unstyled">
                                    {correctlyGuessedMemes.map((entry, idx) => (
                                        <li key={idx} className="mb-4">
                                            <Card className="large-card">
                                                <Row>
                                                    <Col md={4}>
                                                        {entry.meme && <Card.Img src={`http://localhost:3001/${entry.meme.immagine}`} className="img-fluid left-img" />}
                                                    </Col>
                                                    <Col md={8}>
                                                        <Card.Body>
                                                            <Card.Text>
                                                                <strong>Given Answer:</strong> {entry.caption ? entry.caption.text : 'No Answer'}
                                                            </Card.Text>
                                                            <Card.Text>
                                                                <strong>Points Earned:</strong> 5 points ✅
                                                            </Card.Text>
                                                        </Card.Body>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </li>
                                    ))}
                                </ul>
                                </div>
                            ) : (
                                <div>
                                    <h2>No correctly guessed memes.</h2>
                                    <img src="/donotgiveup.jpg" alt="background" className="my-5 half-page-img"  />
                                </div>


                            )}
                        </div>
                    ) : (
                        <div>
                     <p>Log in to play games with three round and see game history.</p>
                     <img src="/logintounlock.jpg" alt="background" className="my-5 half-page-img"  />
                        </div>
   

                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default GameOverPage;
