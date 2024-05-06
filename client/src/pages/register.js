import {Form} from "./components/credentials_form";
import * as React from "react";

const form = {
    title: "Register",
    button_title: "Register",
    subtitle: "Already have an account?",
    subtitle_button_name: "Login",
    subtitle_button_link: "/login",
    endpoint: "/register",
    additional: { role: "DEV" },
};

export default function Register() {
  return <Form {...form} />;
}
