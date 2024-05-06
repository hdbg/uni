import { Form } from "./components/credentials_form";
import * as React from "react";

const form = {
  title: "Login",
  button_title: "Login",
  subtitle: "Don't have an account?",
  subtitle_button_name: "Register",
  subtitle_button_link: "/register",

  endpoint: "/auth",
  additional: {},
};

export default function Register() {
  return <Form {...form} />;
}
