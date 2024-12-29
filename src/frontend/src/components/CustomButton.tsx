import React from 'react';
import Button from 'react-bootstrap/Button';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "../css/components/CustomButton.css"
import LoadingSpinner from "./LoadingSpinner";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    colorScheme?: 'primary' | 'secondary' | 'danger'; // Custom property for color scheme
    loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ colorScheme = "primary", loading = false, ...props }) => {
    return (
        <Button className={`custom-button ${props.className || ""}`} variant={colorScheme} {...props}>
            {loading ? <LoadingSpinner /> : props.children}
        </Button>
    )
};

export default CustomButton;
