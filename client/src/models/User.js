export default function User(id, email, name, hash, salt) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.hash = hash;
    this.salt = salt;

}