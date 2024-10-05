
import PropTypes from "prop-types";
import { Link} from 'react-router-dom';
import { Col, Container, Row } from "react-bootstrap/";
import { LogoutButton } from './AuthComponents';

function Header(props) {
    return <header className="py-1 py-md-3 border-bottom bg-primary fixed-top">
        <Container fluid className="gap-3 align-items-center">
            <Row>
                <Col xs={6} md={10}>
                    <a href="/"
                       className="d-flex align-items-center justify-content-center justify-content-md-start h-100 link-light text-decoration-none">
                        <i className="bi bi-mastodon me-2 flex-shrink-0"></i>
                    
                        <span className="h1 mb-0">Meme Game</span>
                    </a>
                </Col>
                <Col xs={6} md={2} className="d-flex align-items-center justify-content-end gap-3">
                    {props.loggedIn ? (
                        <>
                            <LogoutButton logout={props.logout} className='me-2' />
                            <Link to='/profile' className='btn btn-outline-light'>
                                 History
                            </Link>
                        </>
                    ) : (
                        <Link to='/login' className='btn btn-outline-light'>Login</Link>
                    )}
                </Col>
            </Row>
        </Container>
    </header>;
}

Header.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    logout: PropTypes.func
}

export default Header;
