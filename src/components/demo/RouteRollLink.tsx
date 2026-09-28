import { Link, type LinkProps } from 'react-router-dom';
import { RollInner } from '../shared';

/** Same bordered roll-fill button as RollLink, but a client-side React Router Link. */
export default function RouteRollLink({ text, className = '', ...rest }: { text: string; className?: string } & LinkProps) {
  return (
    <Link className={`roll-btn ${className}`} {...rest}>
      <RollInner text={text} />
    </Link>
  );
}
