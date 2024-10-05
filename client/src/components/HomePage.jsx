import { Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function HomePage(props) {
    const navigate = useNavigate();
    const loggedIn = props.loggedIn; // Define the 'loggedIn' variable

    const startSingleRoundGame = () => {
        navigate('/single-round-game');
    };

    const startMultiRoundGame = () => {
        navigate('/multi-round-game');
    };

    return (
        <div className="min-vh-100 text-center mt-5">
            <Col>
                    <h1>Welcome to Meme Game!</h1>
                    {loggedIn? (
                        <>
                            <p>Play a multi-round game as a logged-in user.</p>
                            <Button onClick={startMultiRoundGame}>Start Multi-Round Game</Button>
                        </>
                    ) : (
                        <>
                            <p>Play a single round of Meme Game as a guest or login to play a true game</p>
                            <Button onClick={startSingleRoundGame}>Start Single Round Game</Button>
                        </>
                    )}

                <Row><Col>
                <img src="/background.jpg" alt="background" className="my-5 half-page-img"  />

                </Col>
                </Row>           
            
            </Col>

            
        </div>
    );
}

HomePage.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
};

export default HomePage;
