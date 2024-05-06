import React from 'react';
import { GlobalContext } from '../global';
import { Form } from './components/credentials_form';
import { Navigate } from 'react-router-dom';

export default function CreateUserAccount() {
    const context = React.useContext(GlobalContext);

    if (context.user == null) {
        return <Navigate to="/login" />;
    }
    
    const form = {
        title: "Create User Account",
        button_title: "Create",
        endpoint: "/register",
        additional: { role: "USER" },
        is_custom: true,
    };

    return <Form {...form} />;
}