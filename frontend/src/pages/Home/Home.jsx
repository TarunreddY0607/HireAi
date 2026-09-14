import "./Home.css";

import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import About from "../../components/About/About";
import Footer from "../../components/Footer/Footer";

function Home() {
    return (
        <div className="home">
            <Navbar />
            <Hero />
            <Features />
            <About />
            <Footer />
        </div>
    );
}

export default Home;