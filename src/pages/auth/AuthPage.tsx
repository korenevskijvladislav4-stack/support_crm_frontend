import { useState, type ChangeEvent, type FC } from "react"
import { type IAuth } from "../../types/auth.types"
import { useSignInMutation } from "../../api/authApi"
import { AuthCard, AuthForm } from "../../components/Auth"
import { SecurityScanOutlined } from '@ant-design/icons'
import styles from "../../styles/auth/auth-page.module.css"

const AuthPage: FC = () => {
  const [authForm, setAuthForm] = useState<IAuth>({
    email: '',
    password: ''
  })
  
  const [signIn, { isLoading, error }] = useSignInMutation()
  
  const onFormChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value })
  }
  
  const onClickHandler = async () => {
    try {
      const { token } = await signIn(authForm).unwrap()
      localStorage.setItem('auth_token', token)
    } catch (e) {
      console.error(e)
    }
  }

  const isFormValid = () => {
    return authForm.email && authForm.password
  }

  return (
    <div className={styles.authContainer}>
      <AuthCard
        title="Вход в систему"
        description="Войдите в свой аккаунт SupportCRM"
        icon={<SecurityScanOutlined />}
      >
        <AuthForm
          form={authForm}
          onFormChange={onFormChangeHandler}
          onSubmit={onClickHandler}
          isLoading={isLoading}
          error={error}
          isValid={isFormValid()}
        />
      </AuthCard>
    </div>
  )
}

export default AuthPage