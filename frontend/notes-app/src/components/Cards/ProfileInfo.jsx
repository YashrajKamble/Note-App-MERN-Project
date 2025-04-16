import PropTypes from "prop-types";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <div className="w-8 sm:w-12 h-8 sm:h-12 flex items-center justify-center rounded-full text-slate-950 sm:font-medium bg-slate-100">
        {getInitials(userInfo?.fullName)}
      </div>

      <div >
        <p className="text-sm sm:text-sm w-6 sm:w-20 font-normal">
          {userInfo && userInfo.fullName}
        </p>
        <button
          className="text-sm text-slate-700  sm:pr-0  pl:5 underline"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

ProfileInfo.propTypes = {
  userInfo: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
};

export default ProfileInfo;
