import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import API from '../API.js';
import '../App.css';
import PropTypes from 'prop-types';


const SingleGameHistory = (props) => {
    const { user } = props.user;
    const location = useLocation();
    const { game } = location.state || {};
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');


    useEffect(() => {
        const fetchGameDetails = async () => {
            if (!game) {
                navigate('/profile');
                return;
            }
            try {
                const gameRounds = await API.getRoundsByGameiD(game.id);
                const roundsWithDetails = await Promise.all(gameRounds.map(async r => {
                    const meme = await API.getMemeById(r.id_meme);
                    return {
                        ...r,
                        meme
                    };
                }));
                setRounds(roundsWithDetails);


            } catch (err) {
                if (err.response && err.response.status === 401) {
                    navigate('/not-authorized');
                } else {
                    setMessage(`Error loading game details: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchGameDetails();
    }, [game, user, navigate]);

    if (loading) {
        return (
            <Container className="mt-3 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    const totalPoints = rounds.reduce((acc, round) => acc + round.punteggio, 0);

    /*
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    };
    */

    return (
        <Container className="mt-5 text-center ">
            <Row className="justify-content-center">
                <Col md={4} className="fixed-col">
                    <h2>Game Score: {totalPoints}</h2>
                    <h4>Date: {game.date}</h4>
                </Col>
                <Col md={8}  className="scroll-col">
                    <div>
                        <h3 className="mb-4">Meme Details</h3>
                        <ul className="list-unstyled">
                            {rounds.map((round, idx) => (
                                <li key={idx} className="mb-4">
                                    <Card className="medium-card">
                                        <Row>
                                            <Col md={4}>
                                                {round.meme && <Card.Img src={`http://localhost:3001/${round.meme.immagine}`} className="img-fluid left-img" />}

                                            </Col>
                                            <Col md={8}>
                                                <Card.Body>
                                                    <Card.Text>
                                                        <strong>Points Earned:</strong> {round.punteggio ? '5 points ✅' : '0 points ❌'}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Col>
                                        </Row>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

SingleGameHistory.propTypes = {
    user: PropTypes.object.isRequired,
};

export default SingleGameHistory;
