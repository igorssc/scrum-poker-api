export const capitalizeInitials = (input: string) => {
  const words: string[] = input.split(' ');

  const capitalizedWords: string[] = words.map((word) => {
    return (
      word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
    );
  });

  const capitalizedString: string = capitalizedWords.join(' ');

  return capitalizedString;
};
