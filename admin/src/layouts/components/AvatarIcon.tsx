import type { MenuProps } from 'antd';
import { Avatar, Modal, Menu, Dropdown, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { HOME_URL } from '@/config/config';
import { connect } from 'react-redux';
import { logout } from '@/redux/modules/global/action';

const AvatarIcon = (props: any) => {
  const { avatar } = props;
  const navigate = useNavigate();
  // 退出登录
  const logout = () => {
    Modal.confirm({
      title: '温馨提示 🧡',
      icon: <ExclamationCircleOutlined />,
      content: '是否确认退出登录？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        props.logout();
        message.success('退出登录成功！');
        navigate('/login');
      },
    });
  };

  // Dropdown Menu
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className="dropdown-item">首页</span>,
      onClick: () => navigate(HOME_URL),
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: <span className="dropdown-item">退出登录</span>,
      onClick: logout,
    },
  ];
  return (
    <>
      <Dropdown menu={{ items }} placement="bottom" arrow trigger={['click']}>
        <Avatar size="large" src={avatar} />
      </Dropdown>
    </>
  );
};

const mapDispatchToProps = { logout };
export default connect(null, mapDispatchToProps)(AvatarIcon);
