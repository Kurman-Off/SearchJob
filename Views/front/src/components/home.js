import React from "react";
import "../style/home.css"
import "../style/header.css"
import Header from "./header";

function Home() {
    return (
        <div className="home-container">
            <Header />

            <h1>Home Page</h1>
        </div>
    )
}

export default Home;