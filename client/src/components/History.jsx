import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API.js';
import { UnauthorizedError } from '../API.js';
import PropTypes from 'prop-types';
import FeedbackContext from '../contexts/FeedbackContext.js';



const History = (props) => {
    const user=props.user;
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalScore, setTotalScore] = useState(0); // Stato per il punteggio totale
    const navigate = useNavigate();


    useEffect(() => {
        const fetchGames = async () => {
            try {
                const userGames = await API.getGamesByUserId(user.id);
                setGames(userGames);

                // Calcola il punteggio totale
                const totalScore = userGames.reduce((acc, game) => acc + game.score, 0);
                setTotalScore(totalScore);
            } catch (err) {
                if (err instanceof UnauthorizedError) {
                    navigate('/not-authorized');
                } else {
                    setLoading(false);
                    FeedbackContext.setErrorFeedback(`Error loading games: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, [user, navigate]);

    const handleViewGame = (game) => {
        navigate(`/game/${game.id}`, { state: { game } });
    };


    return (
        <Container className="mt-3">
            <Row className="justify-content-center">
                <Col md={4} className='fixed-col'>
                    <h1 className="text-center">{user?.name}'s Profile</h1>
                    <ul className="text-center list-unstyled">
                        <li><strong>Email:</strong> {user?.email}</li>
                        <li><strong>Total Score:</strong>{totalScore}</li>
                    </ul>
                    {totalScore >= 100 && <p className="text-center">You are a meme master!</p>}
                    {totalScore<100 && <p className="text-center">You are a meme apprentice!</p>}

  
                </Col>
                <Col md={8} className='scroll-col'>
                    <h4 className="text-center">Game History</h4>
                    
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {games.length === 0 ? (
                                <p className="text-center">No games found.</p>
                            ) : (
                                <Row>
                                    {games.map((game, idx) => (
                                        <Col key={idx} md={6} className="mb-4">
                                            <Card>
                                                <Card.Body>
                                                    <Card.Title>Game {idx + 1}</Card.Title>
                                                    <Card.Text>
                                                        <strong>Score:</strong> {game.score}
                                                        <br />
                                                        <strong>Date:</strong> {game.date}
                                                    </Card.Text>
                                                    <Button variant="primary" onClick={() => handleViewGame(game)}>
                                                        View Details
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

History.propTypes = {
    user: PropTypes.object.isRequired,
};

export default History;
