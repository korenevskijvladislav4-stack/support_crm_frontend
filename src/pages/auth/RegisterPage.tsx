import { Button } from "antd"
import { useState, type ChangeEvent, type FC } from "react"
import { type IRegistrationForm } from "../../types/auth.types"
import { useSignUpMutation } from "../../api/authApi"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../hooks/store"
import { attemptsApi } from "../../api/attemptsApi"
import { AuthCard, RegisterForm } from "../../components/Auth"
import { IdcardOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import styles from "../../styles/auth/auth-page.module.css"

const RegisterPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [registrationForm, setRegistrationForm] = useState<IRegistrationForm>({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: ''
  })
  
  const [signUp, { isLoading, error, isSuccess }] = useSignUpMutation()
  
  const onFormChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    setRegistrationForm({ ...registrationForm, [e.target.name]: e.target.value })
  }
  
  const onClickHandler = async () => {
    try {
      await signUp(registrationForm).unwrap()
      setRegistrationForm({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: ''
      })
      dispatch(attemptsApi.util.invalidateTags(['Attempts']));
    } catch (e) {
      console.error(e)
    }
  }

  const isFormValid = (): boolean => {
    return !!(registrationForm.name && 
           registrationForm.surname && 
           registrationForm.email && 
           registrationForm.password)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.registerCardWrapper}>
        <Button 
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/login')}
          className={styles.backButton}
        >
          Назад к входу
        </Button>

        <AuthCard
          title="Регистрация"
          description="Создайте аккаунт для доступа к системе"
          icon={<IdcardOutlined />}
        >
          <RegisterForm
            form={registrationForm}
            onFormChange={onFormChangeHandler}
            onSubmit={onClickHandler}
            isLoading={isLoading}
            error={error}
            isSuccess={isSuccess}
            isValid={isFormValid()}
          />
        </AuthCard>
      </div>
    </div>
  )
}

export default RegisterPage