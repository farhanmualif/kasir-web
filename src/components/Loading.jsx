import React from 'react';
import { Spinner } from 'flowbite-react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
};

export default Loading;