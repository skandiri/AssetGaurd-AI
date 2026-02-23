import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to My Frontend App</h1>
            <p>This is the home page of the application.</p>
        </div>
    );
};

const AboutPage: React.FC = () => {
    return (
        <div>
            <h1>About Us</h1>
            <p>This page contains information about our application.</p>
        </div>
    );
};

export { HomePage, AboutPage };