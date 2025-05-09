// import React from "react";
import { useState } from "react";
import PropTypes from "prop-types"; // <-- Added PropTypes import
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }
  };

  const handleRemoveTags = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => {
            return (
              <span
                key={index}
                className="flex items-center gap-2 text-sm text-slate-900 bg-slate-100 py-1 rounded"
              >
                #{tag}
                <button onClick={() => handleRemoveTags(tag)}>
                  <MdClose />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex-1 sm:flex items-center gap-4 mt-3">
        <input
          type="text"
          value={inputValue}
          className="text-sm bg-transparent border px-3 py-2 rounded outline-none sm:w-40 w-16 ml-0 "
          placeholder="Add Tags"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700 mt-5 sm:mt-0 ml-7 sm:ml-0"
          onClick={addNewTag}
        >
          <MdAdd className="text-2xl text-blue-700 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

// Added prop type validations for the component props
TagInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired, // Ensure tags is an array of strings
  setTags: PropTypes.func.isRequired, // Ensure setTags is a function
};

export default TagInput;
