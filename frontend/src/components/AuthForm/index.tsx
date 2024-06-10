import { ReactNode, SyntheticEvent, useEffect, useState } from "react"
import {
  useInputErrors,
  useLoadError,
  useUserInput,
} from "../../utils/customHooks"

import { InputData } from "../../utils/helpers"
import LoadingError from "../LoadingError"
import AuthButtons from "./AuthButtons"
import CheckboxField from "./CheckboxField"
import InputField from "./InputField"
import styles from "./styles.module.scss"

interface FormProps {
  action: string
  submit(input: InputData): Promise<string | void>
  children?: ReactNode
  exfields?: string[]
}

type PassTypes = "text" | "password"

export default function AuthForm({
  children,
  exfields = ["email"],
  action,
  submit,
}: FormProps) {
  const { input, handleChange } = useUserInput()
  const { warnings, updateWarnings } = useInputErrors()
  const { error, isLoading } = useLoadError()
  const [reveal, setReveal] = useState<PassTypes>("password")

  const togglePass = () => {
    setReveal((prev) => (prev === "text" ? "password" : "text"))
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    isLoading(true)

    try {
      await submit(input)
    } catch (e) {
      const message: string = e.response?.data || e.message
      isLoading(false, message)
    }
  }

  useEffect(() => {
    if (!input.path) return
    const timeoutID = setTimeout(() => {
      updateWarnings(input)
    }, 350)

    return () => {
      clearTimeout(timeoutID)
    }
  }, [input])

  return (
    <form onSubmit={handleSubmit} id={styles.authForm}>
      {exfields.map((field) => {
        return (
          <InputField
            data-cy={field}
            key={field}
            autoComplete={field}
            onChange={handleChange}
            name={field}
            value={input[field]}
            type={field === "email" ? "email" : "text"}
            required
            warning={warnings?.[field]}
          />
        )
      })}

      {
        /* 
          Google recommends adding hidden username inputs even 
          if not necessary for autocompletion purposes 
        */
        exfields.length < 1 && (
          <input
            hidden
            title="hidden username"
            type="text"
            name="username"
            autoComplete="email"
          />
        )
      }

      <InputField
        data-cy="password"
        autoComplete={"new-password"}
        onChange={handleChange}
        name="password"
        value={input.password}
        type={reveal}
        warning={warnings?.password}
        required
      />

      <LoadingError loading={error.loading} message={error.message} />
      <CheckboxField label="Show password" handleChange={togglePass} />

      <AuthButtons
        invalid={Boolean(
          warnings?.email || warnings?.password || warnings?.name
        )}
        action={action}
      >
        {children}
      </AuthButtons>
    </form>
  )
}
