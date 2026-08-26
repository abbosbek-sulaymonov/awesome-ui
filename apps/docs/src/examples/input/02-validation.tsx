import { useState } from "react";
import { Input } from "@abek/awesome-ui";

// The error message is what marks the field invalid — there is no separate
// `invalid` flag to keep in sync.
export default function InputValidation() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <div style={{ maxWidth: "24rem" }}>
      <Input
        label="Email"
        type="email"
        required
        placeholder="you@example.com"
        description="We never share it."
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        {...(invalid ? { errorMessage: "Enter a valid email address." } : {})}
      />
    </div>
  );
}
