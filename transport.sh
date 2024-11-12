#Save node20.tar
docker pull node:20-alpine
docker save -o node20.tar node:20-alpine

#Create folder with node_modules and package.json for npm pack
mkdir -p extracted
cp package.json ./extracted/
cd ./extracted
npm install
npm pack
cp backend-1.0.0.tgz ../3api.tgz
cd ../

#Compress file, c:create archive, z:compress archive, v:list files, f:name
tar -czvf ./archive.tgz -C ./ node20.tar 3api.tgz

#Encrypt archive with gpg
gpg --symmetric --cipher-algo AES256 --output ./archive.tgz.gpg ./archive.tgz

#Generate sha256 hash(fingerprint)
sha256sum ./archive.tgz > ./archive.sha256

#Keep only archive & sha256
rm ./archive.tgz ./node20.tar

echo "Compression, encryption, and SHA256 hash generation complete."