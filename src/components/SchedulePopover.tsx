import type { FC } from "react";
interface IPopoverProps {
    email: string;
    group: string;
}

const SchedulePopover: FC<IPopoverProps> = ({ email, group }) => {
    console.log(email)
    return (
        <div>
            <p>Группа: {group}</p>
            <p>Email: {email}</p>
        </div>
    )
}
export default SchedulePopover