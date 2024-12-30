import React from 'react';
import Button from 'react-bootstrap/Button';
import "../css/components/CustomButton.css"
import LoadingSpinner from "./LoadingSpinner";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    colorScheme?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    showBorder?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ colorScheme = "primary", loading = false, showBorder = true, ...props }) => {
    return (
        <Button
            className={`custom-button ${showBorder ? "" : "noborder"} ${props.className || ""}`}
            style={showBorder ? { backgroundColor: "#3498db"} : { border: "none", backgroundColor: "transparent" }}
            variant={colorScheme}
            {...props}
        >
            {loading ? <LoadingSpinner /> : props.children}
        </Button>
    )
};

export default CustomButton;
