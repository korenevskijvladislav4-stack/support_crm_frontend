import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, Typography, Divider, Alert, Button, message } from 'antd';
import { StarOutlined, GlobalOutlined, TeamOutlined, PlusOutlined, FolderOutlined } from '@ant-design/icons';
import type { IQualityCriteria, CriterionFormValues } from '../../../types/qualityCriterias.types';
import type { ITeam } from '../../../types/teams.type';
import styles from '../../../styles/settings/settings-modals.module.css';
import { 
  useGetAllQualityCriteriaCategoriesQuery, 
  useCreateQualityCriteriaCategoryMutation 
} from '../../../api/qualityCriteriasApi';

const { Text } = Typography;
const { TextArea } = Input;

interface QualityCriteriaModalProps {
  open: boolean;
  editingCriterion: IQualityCriteria | null;
  onOk: (values: CriterionFormValues) => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm<CriterionFormValues>>[0];
  teams?: ITeam[];
  isLoadingTeams: boolean;
  isSubmitting: boolean;
}

const QualityCriteriaModal: React.FC<QualityCriteriaModalProps> = ({
  open,
  editingCriterion,
  onOk,
  onCancel,
  form,
  teams,
  isLoadingTeams,
  isSubmitting
}) => {
  const isGlobal = Form.useWatch('is_global', form);
  const categoryId = Form.useWatch('category_id', form);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const { data: categories, isLoading: isLoadingCategories } = useGetAllQualityCriteriaCategoriesQuery();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateQualityCriteriaCategoryMutation();

  const handleFormSubmit = async (values: CriterionFormValues) => {
    await onOk(values);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      message.warning('Введите название категории');
      return;
    }

    try {
      const newCategory = await createCategory({ name: newCategoryName.trim() }).unwrap();
      form.setFieldValue('category_id', newCategory.id);
      setNewCategoryName('');
      message.success('Категория успешно создана');
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('Ошибка при создании категории');
    }
  };

  return (
    <Modal
      title={editingCriterion ? 'Редактирование критерия' : 'Создание нового критерия'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText={editingCriterion ? 'Сохранить' : 'Создать критерий'}
      cancelText="Отменить"
      width={700}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        size="middle"
        onFinish={handleFormSubmit}
        initialValues={{
          max_score: 100,
          is_global: false,
          team_ids: [],
          description: '',
        }}
      >
        <Form.Item 
          name="name"
          label="Название" 
          rules={[{ required: true, message: 'Введите название критерия' }]}
          className={styles.formItem}
        >
          <Input 
            placeholder="Введите название критерия"
            prefix={<StarOutlined />}
            size="large"
          />
        </Form.Item>

        <Form.Item 
          name="description"
          label="Описание"
          className={styles.formItem}
        >
          <TextArea 
            rows={3}
            placeholder="Введите описание критерия (необязательно)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item 
          name="max_score"
          label="Макс. баллы" 
          rules={[
            { required: true, message: 'Введите максимальный балл' },
            { type: 'number', min: 1, max: 1000, message: 'От 1 до 1000' }
          ]}
          className={styles.formItem}
        >
          <InputNumber 
            min={1}
            max={1000}
            style={{ width: '100%' }}
            placeholder="100"
            size="large"
          />
        </Form.Item>

        <Form.Item 
          name="is_global"
          label="Глобальный критерий"
          valuePropName="checked"
          className={styles.formItem}
        >
          <Switch 
            checkedChildren={<GlobalOutlined />}
            unCheckedChildren={<StarOutlined />}
          />
        </Form.Item>

        <Form.Item 
          name="category_id"
          label="Категория"
          className={styles.formItem}
        >
          <Select
            placeholder="Выберите категорию (необязательно)"
            loading={isLoadingCategories}
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            value={categoryId}
            onChange={(value) => {
              form.setFieldValue('category_id', value);
            }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                  <Input
                    placeholder="Название новой категории"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onPressEnter={handleCreateCategory}
                    size="small"
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateCategory}
                    loading={isCreatingCategory}
                    size="small"
                  >
                    Создать
                  </Button>
                </div>
              </>
            )}
          >
            {categories?.map((category) => (
              <Select.Option key={category.id} value={category.id} label={category.name}>
                <div className={styles.optionContent}>
                  <FolderOutlined />
                  {category.name}
                </div>
              </Select.Option>
            ))}
          </Select>
          <Text type="secondary" className={styles.helpText}>
            Выберите категорию для группировки критериев или создайте новую
          </Text>
        </Form.Item>

        <Form.Item 
          name="team_ids"
          label="Команды"
          dependencies={['is_global']}
          rules={[
            {
              validator: (_, value) => {
                const currentIsGlobal = form.getFieldValue('is_global');
                if (!currentIsGlobal && (!value || value.length === 0)) {
                  return Promise.reject(new Error('Выберите хотя бы одну команду или сделайте критерий глобальным'));
                }
                return Promise.resolve();
              }
            }
          ]}
          className={styles.formItemSmall}
        >
          <Select
            mode="multiple"
            placeholder="Выберите команды для критерия"
            disabled={isGlobal}
            loading={isLoadingTeams}
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            onChange={(value) => {
              const teamIds = value || [];
              form.setFieldValue('team_ids', teamIds);
            }}
          >
            {teams?.map((team) => (
              <Select.Option key={team.id} value={team.id} label={team.name}>
                <div className={styles.optionContent}>
                  <TeamOutlined />
                  {team.name}
                </div>
              </Select.Option>
            ))}
          </Select>
          <Text type="secondary" className={styles.helpText}>
            {isGlobal 
              ? 'Глобальный критерий применяется ко всем командам'
              : 'Выберите команды, для которых будет применяться этот критерий'}
          </Text>
        </Form.Item>
      </Form>

      <Divider />

      <Alert
        message="Информация о критериях"
        description="Глобальные критерии применяются ко всем командам автоматически. Локальные критерии можно назначить только выбранным командам."
        type="info"
        showIcon
        className={styles.alert}
      />
    </Modal>
  );
};

export default QualityCriteriaModal;

