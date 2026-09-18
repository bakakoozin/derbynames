ALTER TABLE `derbynames`
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`derbyname`, `email`, `derbyType`);