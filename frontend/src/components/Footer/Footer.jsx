import "./Footer.css";
import {
    FaWhatsapp,
    FaInstagram
} from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="footer-container">
                <div className="footer-about">
                    <div className="footer-brand">
                        <div className="brand-badge-icon">
                            <HiSparkles className="brand-sparkle-icon" />
                        </div>
                        <h2>
                            Hire<span className="brand-logo-gradient">AI</span>
                        </h2>
                    </div>

                    <p>
                        The intelligent talent workspace bridging ambitious candidates and high-growth companies with neural ATS scoring, automated interview simulations, and verified skill mapping.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Platform</h3>
                    <ul>
                        <li><a href="#home">Overview</a></li>
                        <li><a href="#features">AI Features</a></li>
                        <li><a href="#about">About Engine</a></li>
                        <li><a href="#contact">Enterprise Contact</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h3>Direct Inquiries</h3>
                    <p><FiMail /> hireai.support@gmail.com</p>
                    <p><FiPhone /> +91 62810 92012</p>
                    <p><FiMapPin /> Hyderabad, India</p>
                </div>

                <div className="footer-social">
                    <h3>Connect</h3>
                    <div className="social-icons">
                        <a 
                            href="https://wa.me/916281092012?text=Hello%20HireAI%20Team,%20I%20have%20an%20inquiry." 
                            target="_blank" 
                            rel="noreferrer" 
                            aria-label="WhatsApp"
                            className="social-icon-whatsapp"
                        >
                            <FaWhatsapp />
                        </a>
                        <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noreferrer" 
                            aria-label="Instagram"
                            className="social-icon-instagram"
                        >
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} HireAI Platform Inc. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <span>Privacy Policy</span>
                    <span>•</span>
                    <span>Terms of Service</span>
                    <span>•</span>
                    <span>Security</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;