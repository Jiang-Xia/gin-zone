import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Avatar, Image, Space, Tag } from 'antd';
import { useRef } from 'react';
import { momentList } from '@/api/modules/moment';
const basrUrl = process.env.REACT_APP_BASE_URL;
type GithubIssueItem = {
  url: string;
  id: number;
  number: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  userInfo: any;
  urls: string;
};

const columns: ProColumns<GithubIssueItem>[] = [
  {
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 48,
  },
  {
    title: '头像',
    dataIndex: 'userInfo.avatar',
    key: 'userInfo.avatar',
    valueType: 'avatar',
    width: 80,
    render: (text, record, _, action) => {
      // console.log({ record });
      const userInfo: any = record.userInfo;
      return (
        <>
          <Avatar src={userInfo.avatar} />
          {text}
          <span>{userInfo.nickName}</span>
        </>
      );
    },
  },
  {
    title: '动态内容',
    dataIndex: 'content',
    copyable: true,
    ellipsis: true,
    tip: '动态内容',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: '动态图片',
    dataIndex: 'urls',
    key: 'urls',
    valueType: 'image',
    width: 110,
    render: (text, record, _, action) => {
      const urls: any = record.urls.split(',');
      const list = urls.map((v: string, i: number) => {
        // console.log({ v });
        return <Image width={100} height={66} src={basrUrl + v}></Image>;
      });
      return (
        <div style={{ width: 100, height: 66, overflow: 'hidden' }}>
          <Image.PreviewGroup>{list}</Image.PreviewGroup>
        </div>
      );
    },
  },
  {
    title: '位置',
    // key: 'location',
    dataIndex: 'location',
    hideInSearch: true,
  },
  {
    title: '点赞数',
    dataIndex: 'likes',
    hideInSearch: true,
  },
  {
    title: '浏览数',
    dataIndex: 'views',
    hideInSearch: true,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    sorter: true,
    hideInSearch: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    valueType: 'dateTime',
    search: {
      transform: value => {
        return { updatedAt: value };
      },
    },
  },
  // {
  //   title: '操作',
  //   valueType: 'option',
  //   key: 'option',
  //   render: (text, record, _, action) => [
  //     <a
  //       key="editable"
  //       onClick={() => {
  //         action?.startEditable?.(record.id);
  //       }}
  //     >
  //       编辑
  //     </a>,
  //     <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
  //       查看
  //     </a>,
  //     <TableDropdown
  //       key="actionGroup"
  //       onSelect={() => action?.reload()}
  //       menus={[
  //         { key: 'copy', name: '复制' },
  //         { key: 'delete', name: '删除' },
  //       ]}
  //     />,
  //   ],
  // },
];

export default () => {
  const actionRef = useRef<ActionType>();
  return (
    <ProTable<GithubIssueItem>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}, sort, filter) => {
        console.log(params);
        params.page = params.current;
        const res = await momentList(params);
        return { data: res.data.list };
      }}
      editable={{
        type: 'multiple',
      }}
      columnsState={{
        persistenceKey: 'pro-table-singe-demos',
        persistenceType: 'localStorage',
        onChange(value) {
          console.log('value: ', value);
        },
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      form={{
        // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
        syncToUrl: (values, type) => {
          if (type === 'get') {
            return {
              ...values,
              created_at: [values.startTime, values.endTime],
              page: values.current,
            };
          }
          return values;
        },
      }}
      pagination={{
        pageSize: 20,
        onChange: page => console.log(page),
      }}
      dateFormatter="string"
      headerTitle="动态列表"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          onClick={() => {
            actionRef.current?.reload();
          }}
          type="primary"
        >
          新建
        </Button>,
        // <Dropdown
        //   key="menu"
        //   menu={{
        //     items: [
        //       {
        //         label: '1st item',
        //         key: '1',
        //       }
        //     ],
        //   }}
        // >
        //   <Button>
        //     <EllipsisOutlined />
        //   </Button>
        // </Dropdown>,
      ]}
    />
  );
};
