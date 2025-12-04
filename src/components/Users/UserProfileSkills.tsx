import React from 'react';
import { Card, List, Flex, Progress, Typography } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import styles from '../../styles/users/user-profile.module.css';

const { Text } = Typography;

interface Skill {
  name: string;
  level: number;
}

interface UserProfileSkillsProps {
  skills: Skill[];
}

const UserProfileSkills: React.FC<UserProfileSkillsProps> = ({ skills }) => {
  return (
    <Card 
      title={
        <span>
          <StarOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          Навыки и компетенции
        </span>
      }
      className={styles.skillsCard}
    >
      <List
        dataSource={skills}
        renderItem={(skill) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <Flex justify="space-between" style={{ marginBottom: 4 }}>
                <Text>{skill.name}</Text>
                <Text strong>{skill.level}%</Text>
              </Flex>
              <Progress 
                percent={skill.level} 
                size="small" 
                showInfo={false}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UserProfileSkills;

