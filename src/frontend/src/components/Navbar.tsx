import React from 'react';
import {Link} from "react-router-dom";
import "../css/components/Navbar.css";

const Navbar = () => {


    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    <div style={{ width: "32px", height: "100%"}}>
                        <img style={{alignSelf: "center", margin: "1rem 0"}} className="navbar-image"
                         src="https://cdn.discordapp.com/attachments/520734295112024064/1318076464595337326/newver2-removebg-preview_1.png?ex=676101dd&is=675fb05d&hm=9d735c4f6b5500ca85b7cc8a1d8e4ce3b50fa2aa6426ffb35e4350b20ac93772&"/>
                    </div>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;