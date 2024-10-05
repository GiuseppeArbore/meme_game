/* eslint-disable react/prop-types */
import {Col, Container, Row} from "react-bootstrap";
import {Link, Outlet} from "react-router-dom";


export function PageLayout() {
    return (
        <Row className="flex-grow-1">
            <Col md={12} className="pt-3">
                <Outlet/>
            </Col>
        </Row>
    );
}
export function NotFoundLayout() {
    return (
        <Container className="not-found-container">
            <Row><Col><h2>Error 404: page not found!</h2></Col></Row>
            <Row><Col> <img src="/GitHub404.png" alt="page not found" className="my-3 half-page-img" />
            </Col></Row>
            <Row><Col> <Link to="/" className="btn btn-primary mt-2 my-5">Go Home!</Link> </Col></Row>
        </Container>
    );
}
