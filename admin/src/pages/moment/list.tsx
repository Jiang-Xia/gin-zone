import { Button } from 'antd';
import type { FC } from 'react';
const Moment: FC = () => (
  <div className="moment">
    <Button type="primary">Primary Button</Button>
    <Button>Default Button</Button>
    <Button type="dashed">Dashed Button</Button>
    <Button type="text">Text Button</Button>
    <Button type="link">Link Button</Button>
  </div>
);
export default Moment;
